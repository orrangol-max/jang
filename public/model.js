// Illustrative planning assumptions, not official tourism statistics or live prices.
export const places = [
 {id:'hyeopjae',name:'협재해수욕장',region:'서쪽 · 한림',tags:['자연','휴식'],x:22,y:49,fee:0,desc:'에메랄드빛 바다 앞에서 천천히 걷는 시간',icon:'≈'},
 {id:'osulloc',name:'오설록 티뮤지엄',region:'서쪽 · 안덕',tags:['문화','휴식'],x:30,y:65,fee:0,desc:'차와 초록 풍경을 만나는 느긋한 오후',icon:'♧'},
 {id:'dongmun',name:'동문시장',region:'북쪽 · 제주시',tags:['미식','문화'],x:53,y:27,fee:0,desc:'골목을 따라 만나는 제주의 맛과 일상',icon:'◈'},
 {id:'hamdeok',name:'함덕해수욕장',region:'북동쪽 · 조천',tags:['자연','휴식'],x:67,y:27,fee:0,desc:'맑은 바다를 바라보며 쉬어 가는 해변',icon:'≈'},
 {id:'seongsan',name:'성산일출봉',region:'동쪽 · 성산',tags:['자연'],x:88,y:48,fee:5000,desc:'제주의 화산 지형을 만나는 풍경 산책',icon:'△'},
 {id:'seogwipo',name:'이중섭거리',region:'남쪽 · 서귀포',tags:['문화','미식'],x:55,y:76,fee:0,desc:'예술과 동네의 이야기를 따라 걷는 거리',icon:'▧'},
 {id:'saebyeol',name:'새별오름',region:'중서부 · 애월',tags:['자연'],x:39,y:48,fee:0,desc:'탁 트인 풍경을 만나는 오름 산책',icon:'△'},
 {id:'aewol',name:'애월 한담해안산책로',region:'서쪽 · 애월',tags:['휴식','자연'],x:32,y:32,fee:0,desc:'바닷길을 따라 이어지는 나만의 속도',icon:'≈'}
];
export function calculateBudget({days,people,lodging,meal,transport,selected}) {
 const nights = Math.max(0,days-1);
 const stay = lodging*nights; // One shared room, per night.
 const food = meal*3*days*people;
 const mobility = transport*days; // Per-party daily allowance.
 const activities = selected.reduce((sum,p)=>sum+p.fee,0)*people;
 const subtotal = stay+food+mobility+activities;
 const reserve = Math.round(subtotal*.1);
 return {stay,food,mobility,activities,reserve,total:subtotal+reserve};
}
export function recommend(interests) {
 return [...places].sort((a,b)=>b.tags.filter(t=>interests.includes(t)).length-a.tags.filter(t=>interests.includes(t)).length);
}
