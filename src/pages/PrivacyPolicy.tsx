import { useEffect } from 'react';

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = '개인정보 제3자 제공 동의';
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <main className="p-6">
        <div className="space-y-8 text-[#4E5968] leading-relaxed">
          <section>
            <h2 className="text-[#191F28] font-bold text-lg mb-4">개인정보 제3자 제공 동의</h2>
            <p className="text-sm">
              '그림심리테스트' 서비스 이용을 위해 다음과 같이 개인정보를 제3자에게 제공합니다.
            </p>
          </section>

          <section className="bg-[#F9FAFB] p-5 rounded-2xl space-y-4">
            <div>
              <h3 className="text-[#333D4B] font-bold text-[15px] mb-1">제공받는 자</h3>
              <p className="text-sm">그림심리테스트 서비스</p>
            </div>
            <div>
              <h3 className="text-[#333D4B] font-bold text-[15px] mb-1">제공 목적</h3>
              <p className="text-sm">서비스 이용자 식별 및 개인화 서비스 제공, AI 분석 결과 관리</p>
            </div>
            <div>
              <h3 className="text-[#333D4B] font-bold text-[15px] mb-1">제공 항목</h3>
              <p className="text-sm">이름, 성별, 생년월일, 휴대전화번호</p>
            </div>
            <div>
              <h3 className="text-[#333D4B] font-bold text-[15px] mb-1">보유 및 이용 기간</h3>
              <p className="text-sm font-semibold text-[#191F28]">서비스 회원 탈퇴 시 혹은 동의 철회 시까지</p>
            </div>
          </section>

          <p className="text-[13px] text-[#8B95A1]">
            * 위 개인정보 제공 동의를 거부하실 수 있으나, 거부 시 서비스 이용이 제한될 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
}
