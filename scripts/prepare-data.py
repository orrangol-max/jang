import csv,json,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
aliases={
 'age-visits.csv':'제주 연령대별 방문.csv',
 'travel-expenses.csv':'제주여행 1인당 여행경비.csv',
 'stay-duration.csv':'제주여행 체류기간.csv',
 'regional-visits.csv':'제주 지역별 방문객(읍면동).csv',
 'domestic-satisfaction.csv':'제주여행 내국인관광객 세부 만족도.csv',
}
sources={name:next((p for p in [root/'data/raw'/name,root/'data/raw'/alias] if p.is_file()),None) for name,alias in aliases.items()}
missing=[aliases[name] for name,p in sources.items() if p is None]
if missing:
 raise SystemExit('다음 원본을 data/raw 폴더에 넣어 주세요 (한국어 파일명 그대로 사용 가능):\n'+'\n'.join(missing))
def rows(name):
 with sources[name].open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))
age=rows('age-visits.csv'); costs=rows('travel-expenses.csv'); stays=rows('stay-duration.csv')
months={};seen=set()
for r in age:
 key=(r['기준연월'],r['성별'],r['연령'])
 assert key not in seen, f'Duplicate {key}'
 seen.add(key)
 assert r['시도코드']=='50' and r['성별'] in ['M','W']
 n=int(r['방문객수']);assert n>=0
 bucket=months.setdefault(r['기준연월'],{})
 bucket[r['연령']]=bucket.get(r['연령'],0)+n
for month in months:
 assert len([k for k in seen if k[0]==month])==14
survey={}
for r in costs:
 if r['관광객 구분(내국.외국,크루즈)']=='내국인':survey.setdefault(r['조사 연도'],{})['expense']=int(r['1인당 평균 소비 금액']) if r['1인당 평균 소비 금액'] else None
for r in stays:
 if r['관광객 구분(내국.외국,크루즈)']=='내국인':survey.setdefault(r['조사 연도'],{})['stay']=float(r['평균 체류기간']) if r['평균 체류기간'] else None
result={'months':months,'survey':survey,'provenance':{'source':'제주관광빅데이터플랫폼 · 사용자 제공 원본 CSV','ageRows':len(age),'expenseRows':len(costs),'stayRows':len(stays),'files':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((root/'data/raw').glob('*.csv'))}}}
regions={}; region_seen=set()
for r in rows('regional-visits.csv'):
 key=(r['기준연월'],r['읍면동코드']);assert key not in region_seen
 region_seen.add(key)
 domestic=int(r['내국인 방문객수']);foreign=int(r['외국인 방문객수']);total=int(r['총 방문객수 (내국인+외국인)'])
 assert domestic>=0 and foreign>=0 and domestic+foreign==total
 regions.setdefault(r['기준연월'],[]).append({'code':r['읍면동코드'],'name':r['읍면동명'],'city':r['시군구명'],'domestic':domestic,'foreign':foreign,'total':total})
assert all(len(v)==43 for v in regions.values())
satisfaction={}
for r in rows('domestic-satisfaction.csv'):
 value=r['만족도 점수']
 satisfaction.setdefault(r['조사 연도'],{})[r['세부 항목 카테고리']]=float(value) if value else None
result['regions']=regions
result['satisfaction']=satisfaction
result['provenance']['regionRows']=len(region_seen)
result['provenance']['satisfactionRows']=len(rows('domestic-satisfaction.csv'))
(root/'public/statistics.js').write_text('export const statistics = '+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print(f'Validated {len(age)} age rows / {len(months)} months, {len(costs)} expense rows, {len(stays)} stay rows; exported domestic survey only.')
