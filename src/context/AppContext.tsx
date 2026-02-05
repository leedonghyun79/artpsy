import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * 앱 상태 인터페이스
 */
interface AppState {
  isOnboardingComplete: boolean;
  userName: string;
}

/**
 * Context 값 인터페이스
 */
interface AppContextValue extends AppState {
  completeOnboarding: (userName: string) => void;
  resetApp: () => void;
}

// Context 생성
const AppContext = createContext<AppContextValue | undefined>(undefined);

// LocalStorage 키
const STORAGE_KEY = 'toss-app-state';

/**
 * 초기 상태
 */
const initialState: AppState = {
  isOnboardingComplete: false,
  userName: '',
};

/**
 * LocalStorage에서 상태 로드
 */
function loadStateFromStorage(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...initialState, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
  }
  return initialState;
}

/**
 * LocalStorage에 상태 저장
 */
function saveStateToStorage(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
}

/**
 * AppProvider Props
 */
interface AppProviderProps {
  children: ReactNode;
}

/**
 * App Context Provider
 * - 전역 상태 관리
 * - LocalStorage를 통한 데이터 영속성
 */
export function AppProvider({ children }: AppProviderProps) {
  const [state, setState] = useState<AppState>(loadStateFromStorage);

  // 상태가 변경될 때마다 LocalStorage에 저장
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  /**
   * 온보딩 완료 처리
   */
  const completeOnboarding = (userName: string) => {
    setState(prev => ({
      ...prev,
      isOnboardingComplete: true,
      userName,
    }));
  };

  /**
   * 앱 초기화 (개발/테스트용)
   */
  const resetApp = () => {
    setState(initialState);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value: AppContextValue = {
    ...state,
    completeOnboarding,
    resetApp,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * App Context Hook
 * - Context 값에 안전하게 접근
 */
export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
