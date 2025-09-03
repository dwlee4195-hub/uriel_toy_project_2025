// 서비스 워커 - 오프라인 지원 및 캐싱
const CACHE_NAME = 'inspection-team-v1';
const urlsToCache = [
  '/mobile/',
  '/mobile/index.html',
  '/mobile/tasks.html',
  '/mobile/task-detail.html',
  '/mobile/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// 설치 이벤트
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('캐시 열기');
        return cache.addAll(urlsToCache);
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('오래된 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch 이벤트 - 네트워크 우선, 실패시 캐시
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 유효한 응답이면 캐시에 저장
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // 네트워크 실패시 캐시에서 가져오기
        return caches.match(event.request);
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