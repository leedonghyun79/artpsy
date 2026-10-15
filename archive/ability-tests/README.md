# 능력치 진단 테스트 (보관본)

메인 페이지에서 제거한 테스트 4종입니다. 삭제하지 않고 여기에 보관해뒀어요.

| 카드 | 설명 | 라우트 | 파일 |
| --- | --- | --- | --- |
| ⚡ 순발력 테스트 | 0.1초의 승부 | `/reaction` | `ReactionTest.tsx` |
| ⏰ 시간 테스트 | 정확히 1.00초 | `/timing` | `TimingTest.tsx` |
| 🧠 기억력 테스트 | 가려진 숫자 기억 | `/memory` | `MemoryTest.tsx` |
| 👀 색감 테스트 | 미세한 차이 찾기 | `/color` | `ColorTest.tsx` |

## 다시 살리는 법

1. 파일을 `src/pages/`로 옮기고 `import { useAdMob } from '../../src/hooks/useAdMob'` 를 `'../hooks/useAdMob'`로 되돌린다.
2. `src/App.tsx`에 import와 라우트를 다시 추가한다.
   - `<Route path="/reaction" element={<ReactionTest />} />` 등
3. `src/pages/Home.tsx`에 카드 그리드를 다시 붙인다. 카드 구조는 이전 커밋(`aa3e777`) 의 `Home.tsx`에 있어요.
