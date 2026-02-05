import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'artpsy', // 앱 이름을 변경하세요
  brand: {
    displayName: '그림심리테스트', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: 'https://static.toss.im/appsintoss/13599/d755fb6b-f63b-4408-9605-5f94e3c6f74b.png', // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
  },
  web: {
    host: '192.168.0.201', // 개발 서버 호스트 (로컬 IP로 변경)
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'tsc -b && vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
});
