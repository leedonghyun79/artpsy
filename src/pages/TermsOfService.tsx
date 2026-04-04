import { useEffect } from 'react';

export default function TermsOfService() {
  useEffect(() => {
    document.title = '서비스 이용약관(제휴사)';
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <main className="p-6">
        <div className="space-y-8 text-[#4E5968] leading-relaxed">
          <section>
            <h2 className="text-[#191F28] font-bold text-lg mb-4">그림심리테스트 이용약관</h2>
            <p className="text-sm">
              본 약관은 '그림심리테스트'가 제공하는 서비스의 이용 조건 및 절차에 관한 사항을 규정합니다.
            </p>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-[#333D4B] font-bold text-[15px] mb-1">제 1조 (목적)</h3>
              <p className="text-sm">본 약관은 회사가 제공하는 그림 심리 분석 서비스 및 부가 서비스의 이용과 관련하여 회사와 회원 사이의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
            </div>
            <div>
              <h3 className="text-[#333D4B] font-bold text-[15px] mb-1">제 2조 (서비스의 제공)</h3>
              <p className="text-sm">1. 회사는 AI 기술을 활용한 그림 분석 및 심리 리포트 서비스를 제공합니다.</p>
              <p className="text-sm">2. 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.</p>
            </div>
            <div>
              <h3 className="text-[#333D4B] font-bold text-[15px] mb-1">제 3조 (이용자의 의무)</h3>
              <p className="text-sm">이용자는 관계법령, 본 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항 등을 준수하여야 합니다.</p>
            </div>
          </section>

          <p className="text-[13px] text-[#8B95A1]">
            * 본 서비스는 심리적 조언을 제공할 뿐, 의학적 진단을 대체할 수 없습니다.
          </p>
        </div>
      </main>
    </div>
  );
}
