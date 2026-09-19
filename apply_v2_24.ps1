$ErrorActionPreference = "Stop"

$app = Join-Path $PSScriptRoot "app.js"
if (!(Test-Path $app)) {
  throw "app.js wurde im gleichen Ordner nicht gefunden."
}

$backup = Join-Path $PSScriptRoot ("app_v2.23_backup_" + (Get-Date -Format "yyyyMMdd_HHmmss") + ".js")
Copy-Item $app $backup -Force

$s = Get-Content $app -Raw

$startMarker = "async function readCloudLegacyRow()"
$endMarker   = "function subscribeCloud()"

$start = $s.IndexOf($startMarker)
$end   = $s.IndexOf($endMarker)

if ($start -lt 0 -or $end -lt 0 -or $end -le $start) {
  throw "Der erwartete Cloud-Speicher-Block wurde in app.js nicht gefunden. Es wurde nichts geändert."
}

$block = @'
async function cloudRequest(query,ms=10000,label='Cloud-Anfrage'){
  const controller=typeof AbortController!=='undefined'?new AbortController():null;
  if(controller&&query&&typeof query.abortSignal==='function')query=query.abortSignal(controller.signal);
  let timer=null;
  try{
    if(controller)timer=setTimeout(()=>controller.abort(),ms);
    return await query;
  }catch(e){
    if(e?.name==='AbortError')throw new Error(label+' Timeout nach '+Math.round(ms/1000)+' Sekunden');
    throw e;
  }finally{if(timer)clearTimeout(timer)}
}
async function readCloudLegacyRow(){
  return await cloudRequest(
    cloudClient.from('app_state').select('owner_id,data,updated_at').eq('id',1).maybeSingle(),
    8000,'Cloud-Legacy-Stand'
  );
}
async function readCloudPointer(){
  return await cloudRequest(
    cloudClient.from('app_state_pointer').select('id,owner_id,version_id,updated_at').eq('id',1).maybeSingle(),
    8000,'Cloud-Pointer'
  );
}
async function readCloudChunks(versionId){
  const result=await cloudRequest(
    cloudClient.from('app_state_chunks').select('chunk_index,payload').eq('version_id',versionId).order('chunk_index',{ascending:true}),
    12000,'Cloud-Datenblöcke'
  );
  const {data,error}=result;
  if(error)return {data:null,error};
  const rows=Array.isArray(data)?data:[];
  if(!rows.length)return {data:null,error:new Error('Keine Cloud-Datenblöcke gefunden.')};
  const text=rows.map(x=>String(x.payload||'')).join('');
  try{return {data:JSON.parse(text),error:null};}catch(e){return {data:null,error:e};}
}
async function loadCloudSnapshot(){
  cloudChunkReady=false;
  let pointer;
  try{pointer=await readCloudPointer();}
  catch(e){pointer={data:null,error:e};}
  if(pointer&&!pointer.error){
    cloudChunkReady=true;
    if(pointer.data?.version_id){
      const chunks=await readCloudChunks(pointer.data.version_id);
      if(chunks.error)throw chunks.error;
      const decoded=await decodeCloudData(chunks.data);
      if(!decoded)throw new Error('Cloud-Daten konnten nicht dekodiert werden.');
      return {state:decoded,owner_id:pointer.data.owner_id||null,updated_at:pointer.data.updated_at||'',source:'chunks'};
    }
  }
  const legacy=await readCloudLegacyRow();
  if(legacy.error)throw legacy.error;
  if(legacy.data){
    let state=null;
    if(legacy.data.data&&typeof legacy.data.data==='object')state=await decodeCloudData(legacy.data.data);
    return {state,owner_id:legacy.data.owner_id||null,updated_at:legacy.data.updated_at||'',source:'legacy',pointerMissing:!pointer?.data};
  }
  return {state:null,owner_id:null,updated_at:'',source:'none',pointerMissing:true};
}
async function initCloud(){
  if(!cloudConfigured()){console.warn('DoG RaceHub Cloud: config fehlt.');return false}
  try{
    if(!cloudClient){
      cloudClient=window.supabase.createClient(window.DOG_SUPABASE_URL,window.DOG_SUPABASE_ANON_KEY,{
        auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}
      });
      cloudClient.auth.onAuthStateChange((_event,session)=>{
        cloudUser=session?.user||null;
        cloudOwner=!!cloudUser&&!!cloudOwnerId&&cloudUser.id===cloudOwnerId;
        editor=cloudOwner;
        updateEditorUI();
      });
    }
    const {data:sessionData,error:sessionError}=await cloudWithTimeout(cloudClient.auth.getSession(),8000,'Cloud-Anmeldung');
    if(sessionError)console.warn('DoG RaceHub Auth:',sessionError);
    cloudUser=sessionData?.session?.user||null;

    let snapshot;
    try{snapshot=await loadCloudSnapshot();}
    catch(e){
      console.error('DoG RaceHub Cloud snapshot',e);
      cloudReady=false;cloudOwner=false;editor=false;updateEditorUI();
      toast('Cloud-Daten konnten nicht gelesen werden. Der vorhandene Datenstand bleibt unangetastet.');
      return false;
    }

    if(snapshot.owner_id){
      cloudOwnerId=snapshot.owner_id;
      cloudReady=true;
      if(snapshot.state&&typeof snapshot.state==='object'){
        applyCloudState(snapshot.state);
        markCloudDataUpdatedAt(snapshot.updated_at||'');
        saveLocalCache(false,snapshot.updated_at||'');
        requestAnimationFrame(()=>renderAll());
      }
    }else if(cloudUser){
      cloudOwnerId=cloudUser.id;
      cloudReady=true;
      const result=await cloudRequest(
        cloudClient.from('app_state').insert({id:1,owner_id:cloudUser.id,data:cloudState()}),
        10000,'Cloud-Ersteinrichtung'
      );
      if(result.error){
        console.error(result.error);cloudReady=false;cloudOwnerId=null;cloudOwner=false;editor=false;updateEditorUI();
        toast('Cloud-Start konnte nicht angelegt werden.');return false;
      }
    }else{
      cloudReady=false;cloudOwnerId=null;
    }
    cloudOwner=!!cloudUser&&!!cloudOwnerId&&cloudUser.id===cloudOwnerId;
    editor=cloudOwner;updateEditorUI();subscribeCloud();
    return true;
  }catch(e){
    console.error('Cloud init',e);cloudReady=false;cloudOwner=false;editor=false;updateEditorUI();
    toast('Cloud-Start fehlgeschlagen: '+(e?.message||'Unbekannter Fehler'));return false;
  }
}
function cloudWithTimeout(promise,ms,label='Cloud-Anfrage'){
  return Promise.race([
    promise,
    new Promise((_,reject)=>setTimeout(()=>reject(new Error(label+' Timeout nach '+Math.round(ms/1000)+' Sekunden')),ms))
  ]);
}
async function cloudSave(){
  if(!cloudConfigured())return false;
  if(cloudBusy){cloudSaveQueued=true;toast('☁️ Cloud-Speicherung läuft bereits …');return false}
  if(!cloudClient){try{await initCloud()}catch(e){console.error('DoG RaceHub Cloud init before save',e)}}
  if(!cloudClient)return false;
  cloudBusy=true;
  cloudSaveQueued=false;
  toast('☁️ Cloud-Speicherung läuft …');
  try{
    const {data:sessionData}=await cloudWithTimeout(cloudClient.auth.getSession(),8000,'Cloud-Anmeldung');
    cloudUser=sessionData?.session?.user||cloudUser||null;
    if(!cloudUser){toast('Admin-Anmeldung ist nicht mehr aktiv.');return false}

    const ownerResult=await cloudRequest(
      cloudClient.from('app_state').select('owner_id').eq('id',1).maybeSingle(),
      8000,'Cloud-Berechtigungsprüfung'
    );
    if(ownerResult.error){console.error(ownerResult.error);toast('Cloud-Berechtigung konnte nicht geprüft werden.');return false}
    if(!ownerResult.data){toast('Cloud-Datenbank ist nicht eingerichtet.');return false}
    cloudOwnerId=ownerResult.data.owner_id||null;
    cloudOwner=cloudUser.id===cloudOwnerId;editor=cloudOwner;updateEditorUI();
    if(!cloudOwner){toast('Dieses Konto ist nicht als Admin hinterlegt.');return false}
    cloudReady=true;

    let pointer;
    try{pointer=await readCloudPointer();}
    catch(e){console.error('DoG RaceHub Cloud Pointer',e);toast('Cloud-Pointer nicht erreichbar: '+e.message);return false}
    const serverTs=pointer.data?.updated_at||'';
    const knownCloudTs=cloudDataUpdatedAt();
    if(serverTs&&knownCloudTs){
      const serverMs=Date.parse(serverTs),knownMs=Date.parse(knownCloudTs);
      if(Number.isFinite(serverMs)&&Number.isFinite(knownMs)&&serverMs>knownMs){
        toast('Ein neuerer Cloud-Stand ist vorhanden. Bitte Seite neu laden, bevor du weiter speicherst.');
        return false;
      }
    }

    const updatedAt=new Date().toISOString();
    const encoded=await encodeCloudData(cloudState());
    const serialized=JSON.stringify(encoded);
    const versionId=(crypto.randomUUID?crypto.randomUUID():'dog-'+Date.now()+'-'+Math.random());
    const chunks=[];
    for(let i=0,index=0;i<serialized.length;i+=CLOUD_CHUNK_SIZE,index++){
      chunks.push({owner_id:cloudUser.id,version_id:versionId,chunk_index:index,payload:serialized.slice(i,i+CLOUD_CHUNK_SIZE),updated_at:updatedAt});
    }
    if(!chunks.length)chunks.push({owner_id:cloudUser.id,version_id:versionId,chunk_index:0,payload:'{}',updated_at:updatedAt});

    const chunkResult=await cloudRequest(
      cloudClient.from('app_state_chunks').insert(chunks),
      15000,'Cloud-Daten speichern'
    );
    if(chunkResult.error)throw chunkResult.error;

    const pointerPayload={owner_id:cloudUser.id,version_id:versionId,updated_at:updatedAt};
    let pointerResult;
    if(pointer.data?.id){
      pointerResult=await cloudRequest(
        cloudClient.from('app_state_pointer').update(pointerPayload).eq('id',1).eq('owner_id',cloudUser.id),
        10000,'Cloud-Pointer speichern'
      );
    }else{
      pointerResult=await cloudRequest(
        cloudClient.from('app_state_pointer').insert({id:1,...pointerPayload}),
        10000,'Cloud-Pointer anlegen'
      );
    }
    if(pointerResult.error)throw pointerResult.error;

    markCloudDataUpdatedAt(updatedAt);
    saveLocalCache(false,updatedAt);
    toast('☁️ Cloud-Daten gespeichert.');
    return true;
  }catch(e){
    console.error('DoG RaceHub Cloud Save',e);
    toast('Cloud-Speicherung fehlgeschlagen: '+(e?.message||'Unbekannter Fehler'));
    return false;
  }finally{
    cloudBusy=false;
    if(cloudSaveQueued){cloudSaveQueued=false;setTimeout(()=>cloudSave(),50)}
  }
}
'@

$new = $s.Substring(0,$start) + $block + $s.Substring($end)
Set-Content -Path $app -Value $new -Encoding UTF8

Write-Host ""
Write-Host "DoG RaceHub v2.24 Cloud-Fix wurde angewendet." -ForegroundColor Green
Write-Host "Backup erstellt: $backup"
Write-Host ""
Write-Host "WICHTIG: index.html und sw.js wurden NICHT veraendert."
Write-Host "Bitte jetzt app.js in GitHub Desktop pruefen, committen und pushen."
