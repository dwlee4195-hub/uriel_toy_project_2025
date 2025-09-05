// 서비스 워커 - 오프라인 지원 및 캐싱
const CACHE_NAME = 'inspection-team-v3'; // 버전 업데이트로 캐시 강제 초기화
// 로컬 HTML 파일만 캐싱 (JS 파일은 제외)
const urlsToCache = [
  './',
  './index.html',
  './tasks.html',
  './task-detail.html',
  './notifications.html',
  './login.html'
];

// 설치 이벤트
self.addEventListener('install', event => {
  self.skipWaiting(); // 즉시 활성화
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('캐시 열기');
        // 로컬 리소스만 캐싱
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => {
              console.warn(`${url} 캐싱 실패, 무시하고 계속 진행`);
            });
          })
        );
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 모든 이전 버전 캐시 삭제
          if (cacheName !== CACHE_NAME) {
            console.log('오래된 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 모든 클라이언트 즉시 제어
      return self.clients.claim();
    })
  );
});

// Fetch 이벤트 - 네트워크 우선, 실패시 캐시
self.addEventListener('fetch', event => {
  const requestURL = new URL(event.request.url);
  
  // 외부 리소스는 Service Worker가 처리하지 않음
  if (requestURL.origin !== location.origin) {
    return; // 브라우저가 직접 처리
  }
  
  // chrome-extension:// 프로토콜 무시
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  // JavaScript 파일은 캐시하지 않음 (항상 최신 버전 사용)
  if (event.request.url.includes('.js')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // 로컬 HTML 파일은 네트워크 우선, 실패시 캐시
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 네트워크 성공시 캐시 업데이트
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // 네트워크 실패시 캐시에서 가져오기
        return caches.match(event.request).then(response => {
          if (response) {
            return response;
          }
          // 오프라인 fallback
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
  );
});

// 푸시 알림 수신
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : '새로운 업무가 배정되었습니다.',
    icon: '/mobile/icon-192.png',
    badge: '/mobile/badge-72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'accept',
        title: '수락',
        icon: '/mobile/check.png'
      },
      {
        action: 'reject',
        title: '거절',
        icon: '/mobile/close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('공항 감식팀', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'accept') {
    // 업무 수락 처리
    clients.openWindow('/mobile/task-detail.html');
  } else if (event.action === 'reject') {
    // 업무 거절 처리
    clients.openWindow('/mobile/index.html');
  } else {
    // 알림 본문 클릭
    clients.openWindow('/mobile/tasks.html');
  }
});

// 백그라운드 동기화
self.addEventListener('sync', event => {
  if (event.tag === 'sync-reports') {
    event.waitUntil(syncReports());
  }
});

async function syncReports() {
  // 오프라인에서 작성된 보고서 동기화
  const reports = await getLocalReports();
  for (const report of reports) {
    try {
      await uploadReport(report);
      await removeLocalReport(report.id);
    } catch (error) {
      console.error('보고서 동기화 실패:', error);
    }
  }
}

// 로컬 스토리지에서 보고서 가져오기 (예시)
async function getLocalReports() {
  // IndexedDB에서 보고서 가져오기
  return [];
}

async function uploadReport(report) {
  // 서버로 보고서 업로드
  return fetch('/api/reports', {
    method: 'POST',
    body: JSON.stringify(report),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

async function removeLocalReport(id) {
  // IndexedDB에서 보고서 삭제
}