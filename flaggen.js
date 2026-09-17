/* DoG RaceHub – zusätzliche Nationalitäten / Flaggen
   Läuft nach app.js und erweitert die vorhandene Nationalitätsliste,
   ohne bestehende Einträge oder Fahrerdaten zu verändern.
*/
(() => {
  const extra = [
    {code:'BE',name:'Belgien',flag:'flag-be.png',emoji:'🇧🇪'},
    {code:'JP',name:'Japan',flag:'flag-jp.png',emoji:'🇯🇵'},
    {code:'NL',name:'Niederlande',flag:'flag-nl.png',emoji:'🇳🇱'},
    {code:'IN',name:'Indien',flag:'flag-in.png',emoji:'🇮🇳'},
    {code:'IT',name:'Italien',flag:'flag-it.png',emoji:'🇮🇹'},
    {code:'JM',name:'Jamaika',flag:'flag-jm.png',emoji:'🇯🇲'},
    {code:'TH',name:'Thailand',flag:'flag-th.png',emoji:'🇹🇭'}
  ];

  if (typeof NATIONALITY_OPTIONS !== 'undefined') {
    extra.forEach(item => {
      if (!NATIONALITY_OPTIONS.some(x => x.code === item.code)) {
        NATIONALITY_OPTIONS.push(item);
      }
    });
  }

  if (typeof NATIONALITY_BY_CODE !== 'undefined') {
    extra.forEach(item => {
      NATIONALITY_BY_CODE[item.code] = item;
    });
  }
})();
