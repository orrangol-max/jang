import {places,calculateBudget,recommend} from './model.js';
import {statistics} from './statistics.js';
const $ = id=>document.getElementById(id);
const selected = new Set(['hyeopjae','aewol','osulloc']);
const interests = new Set(['자연','휴식']);
const won = n=>new Intl.NumberFormat('ko-KR').format(n)+'원';
const fields=['age','days','people','transport','budget','lodging','meal'];
function number(id){const el=$(id);const n=Number(el.value);return Math.min(Number(el.max)||Infinity,Math.max(Number(el.min)||0,Number.isFinite(n)?n:0));}
function state(){return {age:$('age').value,days:number('days'),people:number('people'),transport:number('transport'),budget:number('budget'),lodging:number('lodging'),meal:number('meal'),interests:[...interests],selected:places.filter(p=>selected.has(p.id))};}
function toggle(id){selected.has(id)?selected.delete(id):selected.add(id);render();}
function render(){
 const s=state(), b=calculateBudget(s);
 renderStatistics();
 $('budget-label').textContent=won(s.budget);
 $('trip-summary').textContent=`${s.days===1?'당일':`${s.days-1}박 ${s.days}일`} · ${s.people}명 · ${s.selected.length}개 장소 선택`;
 $('total').textContent=won(b.total);$('per-person').textContent=`1인당 약 ${won(Math.round(b.total/s.people))}`;
 const entries=[['숙박',b.stay,'#8eac85'],['식비',b.food,'#d4b477'],['교통',b.mobility,'#83a6a0'],['관광·입장',b.activities,'#d49477'],['예비비 (10%)',b.reserve,'#c7cdbb']];
 $('breakdown').replaceChildren();$('budget-bar').replaceChildren();
 for(const [label,value,color] of entries){const row=document.createElement('div');row.className='budget-row';const dot=document.createElement('i');dot.style.background=color;const name=document.createElement('span');name.textContent=label;const val=document.createElement('strong');val.textContent=won(value);row.append(dot,name,val);$('breakdown').append(row);const seg=document.createElement('span');seg.style.background=color;seg.style.width=`${b.total?value/b.total*100:0}%`;seg.title=`${label} ${won(value)}`;$('budget-bar').append(seg);}
 const diff=s.budget-b.total;$('remaining').classList.toggle('over',diff<0);$('remaining').textContent=diff>=0?`✓ 설정한 예산보다 ${won(diff)} 여유가 있어요.`:`설정한 예산보다 ${won(-diff)} 초과해요. 숙박·식비 또는 여행 조건을 조정해 보세요.`;
 $('pins').replaceChildren();$('places').replaceChildren();$('place-count').textContent=`${places.length}`;
 for(const p of places){const pin=document.createElement('button');pin.type='button';pin.className='pin'+(selected.has(p.id)?' selected':'');pin.style.left=p.x+'%';pin.style.top=p.y+'%';pin.textContent=p.icon;pin.setAttribute('aria-label',p.name);pin.setAttribute('aria-pressed',String(selected.has(p.id)));pin.addEventListener('click',()=>toggle(p.id));$('pins').append(pin);}
 for(const p of recommend([...interests])){const button=document.createElement('button');button.type='button';button.className='place-card'+(selected.has(p.id)?' selected':'');button.setAttribute('aria-pressed',String(selected.has(p.id)));button.setAttribute('aria-label',`${p.name} ${selected.has(p.id)?'선택 해제':'선택'}`);button.innerHTML=`<span class="place-icon">${p.icon}</span><span class="place-check">${selected.has(p.id)?'✓':'+'}</span><h4>${p.name}</h4><span class="region">${p.region}</span><p>${p.desc}</p>${p.tags.map(t=>`<span class="place-tag">${t}</span>`).join('')}`;button.addEventListener('click',()=>toggle(p.id));$('places').append(button);}
}
for(const field of fields)$(field).addEventListener('input',render);
$('interests').addEventListener('click',event=>{const button=event.target.closest('button[data-value]');if(!button)return;const value=button.dataset.value;interests.has(value)?interests.delete(value):interests.add(value);button.classList.toggle('active',interests.has(value));button.setAttribute('aria-pressed',String(interests.has(value)));render();});
function download(){const s=state();const payload={title:'제주, 나에게 맞게',createdAt:new Date().toISOString(),dataStatus:'source-statistics-with-illustrative-planner',reference:{month:$('stat-month').value,year:$('stat-year').value,source:statistics.provenance},notice:'방문 통계와 내국인 조사 통계는 제공 CSV 기반. 추천 태그·위치·계산 비용은 예시 가정값. 조사 평균은 연령별 가격이 아니며 예산과 비용 범위가 같다고 볼 수 없음. 항공·선박 운임 및 주차·추가 체험비 제외.',...s,estimate:calculateBudget(s)};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='나의-제주-여행계획.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('toast').textContent='여행 계획을 파일로 저장했습니다.';$('toast').hidden=false;setTimeout(()=>$('toast').hidden=true,3000);}
function renderStatistics(){
 const month=$('stat-month').value, year=$('stat-year').value;
 renderRegionalStatistics(month,year);
 const values=statistics.months[month],total=Object.values(values).reduce((a,b)=>a+b,0);
 const age=$('age').value,keys=age==='60대 이상'?['60','70']:age==='선택 안 함'?[]:[age.replace('대','')];
 const count=keys.reduce((n,k)=>n+(values[k]||0),0);
 $('age-summary').textContent=keys.length?`${age} · ${new Intl.NumberFormat('ko-KR').format(count)}명 · 제공 연령 집계의 ${(count/total*100).toFixed(1)}%`:'연령대를 선택하면 해당 집계와 전년 동월 변화를 확인할 수 있어요.';
 const previous=statistics.months[String(Number(month.slice(0,4))-1)+month.slice(4)];
 const old=previous?keys.reduce((n,k)=>n+(previous[k]||0),0):0;
 $('age-change').textContent=!keys.length?'전체 연령 분포':old?`전년 동월 대비 ${((count/old-1)*100)>=0?'+':''}${((count/old-1)*100).toFixed(1)}%`:'전년 동월 비교 자료 없음';
 $('age-bars').replaceChildren();
 const max=Math.max(...Object.values(values));
 for(const k of Object.keys(values).sort((a,b)=>Number(a)-Number(b))){const row=document.createElement('div');row.className='stat-bar-row'+(keys.includes(k)?' highlighted':'');const label=document.createElement('span');label.textContent=`${k}대*`;const track=document.createElement('div');track.className='stat-track';const bar=document.createElement('i');bar.style.width=values[k]/max*100+'%';track.append(bar);const value=document.createElement('span');value.textContent=(values[k]/total*100).toFixed(1)+'%';row.append(label,track,value);row.title=`원본 연령 코드 ${k}: ${values[k].toLocaleString('ko-KR')}명`;row.setAttribute('aria-label',row.title+`, ${(values[k]/total*100).toFixed(1)}%`);$('age-bars').append(row);}
 const survey=statistics.survey[year];
 $('survey-cost').textContent=survey.expense==null?'자료 없음':won(survey.expense);
 $('survey-stay').textContent=survey.stay==null?'자료 없음':survey.stay+'일';
 $('survey-year-label').textContent=year+'년 내국인 조사 평균';
 $('age-period').textContent=`${month.slice(0,4)}년 ${Number(month.slice(4))}월 · 성별 M·W 합산`;
}
for(const month of Object.keys(statistics.months).sort().reverse()){const o=document.createElement('option');o.value=month;o.textContent=`${month.slice(0,4)}년 ${Number(month.slice(4))}월`;$('stat-month').append(o);}
for(const year of Object.keys(statistics.survey).sort().reverse()){const o=document.createElement('option');o.value=year;o.textContent=year+'년';$('stat-year').append(o);}
$('stat-month').addEventListener('change',renderStatistics);$('stat-year').addEventListener('change',renderStatistics);
$('download').addEventListener('click',download);$('export').addEventListener('click',download);render();

function renderRegionalStatistics(month,year){
 const group=$('region-group').value;
 const regions=[...(statistics.regions[month]||[])].sort((a,b)=>b[group]-a[group]).slice(0,10);
 $('region-list').replaceChildren();
 for(const [index,r] of regions.entries()){
  const row=document.createElement('div');row.className='regional-row';
  const name=document.createElement('span');name.textContent=`${index+1}. ${r.name}`;
  const value=document.createElement('strong');value.textContent=r[group].toLocaleString('ko-KR')+'명';
  row.append(name,value);$('region-list').append(row);
 }
 $('satisfaction-list').replaceChildren();
 for(const [category,score] of Object.entries(statistics.satisfaction[year]||{})){
  const row=document.createElement('div');row.className='regional-row';
  const name=document.createElement('span');name.textContent=category;
  const value=document.createElement('strong');value.textContent=score===null?'자료 없음':score.toFixed(2)+'점';
  row.append(name,value);$('satisfaction-list').append(row);
 }
}
$('region-group').addEventListener('change',renderStatistics);
