import { useState, useCallback } from 'react';
import { GoogleAdMob } from '@apps-in-toss/web-framework';

// 테스트용 광고 ID (quit_wallet 예제 참조)
// 실제 배포 시에는 발급받은 실제 광고 ID로 교체해야 합니다.
const AD_GROUP_IDS = {
  REWARDED: 'ait.v2.live.6002720767dd45d2',      // 보상형 광고 테스트 ID
  INTERSTITIAL: 'ait.v2.live.5ba4509afe664047',  // 전면형 광고 테스트 ID
} as const;

export function useAdMob() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('Ready');

  const showInterstitial = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      setIsLoading(true);
      setStatus('전면 광고 로딩 중...');

      const handleError = (error: unknown) => {
        console.error('Ad error:', error);
        setStatus(`Error: ${JSON.stringify(error)}`);
        setIsLoading(false);
        reject(error);
      };

      try {
        if (GoogleAdMob.loadAppsInTossAdMob?.isSupported?.()) {
          const adGroupId = AD_GROUP_IDS.INTERSTITIAL;

          GoogleAdMob.loadAppsInTossAdMob({
            options: { adGroupId },
            onEvent: (loadEvent) => {
              if (loadEvent.type === 'loaded') {
                setStatus('전면 광고 로드됨. 표시 중...');

                GoogleAdMob.showAppsInTossAdMob({
                  options: { adGroupId },
                  onEvent: (showEvent) => {
                    if (showEvent.type === 'dismissed') {
                      setStatus('전면 광고 닫힘');
                      setIsLoading(false);
                      resolve();
                    } else if (showEvent.type === 'failedToShow') {
                      handleError('failedToShow');
                    }
                  },
                  onError: handleError,
                });
              }
            },
            onError: handleError,
          });
        } else {
          setStatus('AdMob을 지원하지 않는 환경입니다.');
          setIsLoading(false);
          // 개발 환경 등에서는 바로 성공 처리하거나 에러 처리
          console.warn('AdMob not supported');
          resolve();
        }
      } catch (err) {
        handleError(err);
      }
    });
  }, []);

  const showRewarded = useCallback(() => {
    return new Promise<boolean>((resolve, reject) => {
      setIsLoading(true);
      setStatus('보상형 광고 로딩 중...');
      let isRewarded = false;

      const handleError = (error: unknown) => {
        console.error('Ad error:', error);
        setStatus(`Error: ${JSON.stringify(error)}`);
        setIsLoading(false);
        reject(error);
      };

      try {
        if (GoogleAdMob.loadAppsInTossAdMob?.isSupported?.()) {
          const adGroupId = AD_GROUP_IDS.REWARDED;

          GoogleAdMob.loadAppsInTossAdMob({
            options: { adGroupId },
            onEvent: (loadEvent) => {
              if (loadEvent.type === 'loaded') {
                setStatus('보상형 광고 로드됨. 표시 중...');

                GoogleAdMob.showAppsInTossAdMob({
                  options: { adGroupId },
                  onEvent: (showEvent) => {
                    if (showEvent.type === 'dismissed') {
                      setStatus('보상형 광고 닫힘');
                      setIsLoading(false);
                      resolve(isRewarded);
                    } else if (showEvent.type === 'userEarnedReward') {
                      setStatus('보상 지급 완료!');
                      isRewarded = true;
                    } else if (showEvent.type === 'failedToShow') {
                      handleError('failedToShow');
                    }
                  },
                  onError: handleError,
                });
              }
            },
            onError: handleError,
          });
        } else {
          setStatus('AdMob을 지원하지 않는 환경입니다.');
          setIsLoading(false);
          console.warn('AdMob not supported');
          resolve(false);
        }
      } catch (err) {
        handleError(err);
      }
    });
  }, []);

  return {
    isLoading,
    status,
    showInterstitial,
    showRewarded
  };
}
