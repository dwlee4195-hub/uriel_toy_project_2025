// 사건 상세 페이지 스크립트

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // URL 파라미터에서 사건 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const incidentId = urlParams.get('id');
    
    if (incidentId) {
        loadIncidentDetail(incidentId);
    } else {
        // ID가 없으면 목록 페이지로 리다이렉트
        window.location.href = 'incident-list.html';
    }
});

// 사건 상세 정보 로드
function loadIncidentDetail(incidentId) {
    const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    const incident = incidents.find(i => i.id === incidentId);
    
    if (!incident) {
        alert('사건을 찾을 수 없습니다.');
        window.location.href = 'incident-list.html';
        return;
    }
    
    // 기본 정보 업데이트
    updateBasicInfo(incident);
    
    // AI 분석 결과 업데이트
    updateAIAnalysis(incident);
    
    // 처리 상태 업데이트
    updateProcessingStatus(incident, teams);
    
    // 라이다 이미지 업데이트
    updateLidarImage(incident);
    
    // 사건 타임라인 업데이트
    updateIncidentTimeline(incident, teams);
    
    // 현장 사진 업데이트
    updateFieldPhotos(incident);
}

// 기본 정보 업데이트
function updateBasicInfo(incident) {
    // 사건 ID
    const idElement = document.getElementById('incident-id');
    if (idElement) idElement.textContent = incident.id;
    
    // 위치
    const locationElement = document.getElementById('incident-location');
    if (locationElement) locationElement.textContent = incident.location || 'T1-1F-G01';
    
    // 터미널 정보 업데이트
    const terminalInfoElement = document.getElementById('terminal-info');
    if (terminalInfoElement) {
        const location = incident.location || 'T1-1F-G01';
        if (location.includes('T2')) {
            terminalInfoElement.textContent = 'T2 제2여객터미널';
        } else {
            terminalInfoElement.textContent = 'T1 제1여객터미널';
        }
    }
    
    // 구역 정보 업데이트
    const zoneInfoElement = document.getElementById('zone-info');
    if (zoneInfoElement) {
        const location = incident.location || 'T1-1F-G01';
        if (location.includes('1F')) {
            zoneInfoElement.textContent = '✈️ 국내선 출발 구역';
        } else if (location.includes('2F')) {
            zoneInfoElement.textContent = '✈️ 국내선 도착 구역';
        } else if (location.includes('3F')) {
            zoneInfoElement.textContent = '✈️ 국제선 출발 구역';
        } else {
            zoneInfoElement.textContent = '✈️ 일반 구역';
        }
    }
    
    // 감지 시간
    const timeElement = document.getElementById('detected-time');
    if (timeElement) {
        const detectedTime = new Date(incident.detectedAt || incident.timestamp || Date.now());
        timeElement.textContent = detectedTime.toLocaleString('ko-KR');
    }
    
    // 경과 시간 계산 및 업데이트
    updateElapsedTime(incident);
    
    // 물품 유형
    const typeElement = document.getElementById('object-type');
    if (typeElement) typeElement.textContent = incident.objectType || '미확인 물품';
    
    // 물품 색상
    const colorElement = document.getElementById('object-color');
    if (colorElement) colorElement.textContent = incident.objectColor || '확인 필요';
    
    // 크기
    const sizeElement = document.getElementById('object-size');
    if (sizeElement) sizeElement.textContent = incident.objectSize || '중간';
    
    // 위험도
    const riskElement = document.getElementById('risk-level');
    if (riskElement) {
        const riskLabels = {
            high: { text: '⚠️ 위험도: 높음 - 즉시 처리 필요', color: 'bg-red-900/30 text-red-400' },
            medium: { text: '⚠️ 위험도: 중간 - 주의 관찰', color: 'bg-yellow-900/30 text-yellow-400' },
            low: { text: '✓ 위험도: 낮음 - 일반 확인', color: 'bg-green-900/30 text-green-400' }
        };
        const risk = riskLabels[incident.riskLevel] || { text: '⚠️ 위험도 확인 필요', color: 'bg-gray-700 text-gray-300' };
        riskElement.innerHTML = `<span class="inline-block px-3 py-1 rounded-full text-sm font-medium ${risk.color}">${risk.text}</span>`;
    }
}

// 경과 시간 실시간 업데이트
function updateElapsedTime(incident) {
    const elapsedTimeElement = document.getElementById('elapsed-time');
    if (!elapsedTimeElement) return;
    
    // 처리 완료된 경우 처리 시간 고정
    if (incident.status === 'resolved') {
        let resolvedTime;
        
        // resolution 객체에서 timestamp 또는 resolvedAt 확인
        if (incident.resolution) {
            resolvedTime = new Date(incident.resolution.timestamp || incident.resolution.resolvedAt || Date.now());
        } else {
            // resolution이 없으면 현재 시간 사용
            resolvedTime = new Date();
        }
        
        const detectedTime = new Date(incident.detectedAt || incident.timestamp || Date.now());
        const diffMs = resolvedTime - detectedTime;
        
        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);
        
        // 처리 완료 상태에서는 초 단위 제외하고 표시
        if (hours > 0) {
            elapsedTimeElement.textContent = `${hours}시간 ${minutes}분 (처리 완료)`;
        } else if (minutes > 0) {
            elapsedTimeElement.textContent = `${minutes}분 (처리 완료)`;
        } else {
            elapsedTimeElement.textContent = `${seconds}초 (처리 완료)`;
        }
        
        // 처리 완료 상태에서는 시간 업데이트 중지
        return;
    }
    
    // 처리 중인 경우 실시간 업데이트
    function calculateElapsed() {
        const detectedTime = new Date(incident.detectedAt || incident.timestamp || Date.now());
        const now = new Date();
        const diffMs = now - detectedTime;
        
        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);
        
        if (hours > 0) {
            return `${hours}시간 ${minutes}분 ${seconds}초`;
        } else if (minutes > 0) {
            return `${minutes}분 ${seconds}초`;
        } else {
            return `${seconds}초`;
        }
    }
    
    // 초기 설정
    elapsedTimeElement.textContent = calculateElapsed();
    
    // 1초마다 업데이트 (처리 중인 경우에만)
    const intervalId = setInterval(() => {
        // 현재 상태 다시 확인
        const currentIncidents = JSON.parse(localStorage.getItem('incidents') || '[]');
        const currentIncident = currentIncidents.find(i => i.id === incident.id);
        
        if (currentIncident && currentIncident.status === 'resolved') {
            // 처리 완료로 변경된 경우 타이머 중지
            clearInterval(intervalId);
            updateElapsedTime(currentIncident); // 최종 시간 표시를 위해 재호출
        } else {
            elapsedTimeElement.textContent = calculateElapsed();
        }
    }, 1000);
}

// AI 분석 결과 업데이트
function updateAIAnalysis(incident) {
    // AI 객체 유형
    const aiObjectTypeElement = document.getElementById('ai-object-type');
    if (aiObjectTypeElement) {
        const objectTypeLabels = {
            'luggage': '캐리어',
            'backpack': '백팩', 
            'shopping_bag': '쇼핑백',
            'briefcase': '서류가방'
        };
        
        if (incident.aiAnalysis && incident.aiAnalysis.objectType) {
            const type = objectTypeLabels[incident.aiAnalysis.objectType] || incident.aiAnalysis.objectType;
            const confidence = incident.aiAnalysis.confidence ? Math.round(incident.aiAnalysis.confidence * 100) : 90;
            aiObjectTypeElement.textContent = `${type} (${confidence}% 확률)`;
        } else if (incident.objectType) {
            const type = objectTypeLabels[incident.objectType] || incident.objectType;
            aiObjectTypeElement.textContent = `${type} (분석 완료)`;
        } else {
            aiObjectTypeElement.textContent = '미확인 물품';
        }
    }
    
    // AI 신뢰도
    const confidenceElement = document.getElementById('ai-confidence');
    if (confidenceElement) {
        if (incident.aiAnalysis && incident.aiAnalysis.confidence) {
            const percentage = Math.round(incident.aiAnalysis.confidence * 100);
            confidenceElement.textContent = percentage + '%';
        } else {
            confidenceElement.textContent = '85%';
        }
    }
    
    // 위험 점수
    const riskScoreElement = document.getElementById('risk-score');
    if (riskScoreElement) {
        if (incident.aiAnalysis && incident.aiAnalysis.riskScore) {
            riskScoreElement.textContent = incident.aiAnalysis.riskScore + '/10';
        } else {
            // 위험도에 따라 점수 매핑
            const riskScores = { high: 8, medium: 5, low: 2 };
            const score = riskScores[incident.riskLevel] || 5;
            riskScoreElement.textContent = score + '/10';
        }
    }
    
    // 의심 특징
    const featuresElement = document.getElementById('suspicious-features');
    if (featuresElement) {
        const featureLabels = {
            'unattended': '무인 방치',
            'large_size': '대형 물품',
            'near_crowded_area': '혼잡 구역 인접',
            'medium_duration': '중간 시간 방치',
            'long_duration': '장시간 방치',
            'suspicious_shape': '의심스러운 형태',
            'unusual_location': '비정상적 위치'
        };
        
        let features = [];
        
        if (incident.aiAnalysis && incident.aiAnalysis.suspiciousFeatures) {
            features = incident.aiAnalysis.suspiciousFeatures;
        } else {
            // 기본 특징들을 위험도와 위치 기반으로 생성
            features.push('unattended');
            if (incident.riskLevel === 'high') features.push('long_duration');
            else if (incident.riskLevel === 'medium') features.push('medium_duration');
            
            if (incident.location && incident.location.includes('G')) features.push('near_crowded_area');
        }
        
        const featureHTML = features.map(f => 
            `<span class="inline-block bg-gray-900 text-gray-300 px-2 py-1 rounded text-xs mr-1 mb-1">
                ${featureLabels[f] || f}
            </span>`
        ).join('');
        
        featuresElement.innerHTML = featureHTML || '<span class="text-gray-400">특징 없음</span>';
    }
}

// 처리 상태 업데이트
function updateProcessingStatus(incident, teams) {
    // 상태 텍스트 및 카드 색상 업데이트
    const statusElement = document.getElementById('processing-status');
    const statusCard = statusElement?.closest('.bg-gradient-to-br');
    
    if (statusElement) {
        const statusConfig = {
            pending: { 
                text: '신규 경고', 
                cardClass: 'bg-dark-tertiary border-red-900/50',
                textClass: 'text-red-400'
            },
            assigned: { 
                text: '출동 중',
                cardClass: 'bg-dark-tertiary border-orange-900/50',
                textClass: 'text-orange-400'
            },
            in_progress: { 
                text: '처리 중',
                cardClass: 'bg-dark-tertiary border-orange-900/50',
                textClass: 'text-orange-400'
            },
            resolved: { 
                text: '처리 완료',
                cardClass: 'bg-dark-tertiary border-green-900/50',


                textClass: 'text-green-400'
            }
        };
        
        const config = statusConfig[incident.status] || statusConfig.pending;
        statusElement.textContent = config.text;
        statusElement.className = `text-2xl font-bold ${config.textClass}`;
        
        // 카드 배경색 업데이트 (상태에 따라 테두리 색상 변경)
        if (statusCard) {
            statusCard.className = `${config.cardClass} rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-300`;
        }
    }
    
    // 배정된 팀
    const teamElement = document.getElementById('assigned-team');
    if (teamElement) {
        if (incident.assignedTeam) {
            const team = teams.find(t => t.id === incident.assignedTeam);
            teamElement.textContent = team ? team.name : incident.assignedTeam;
        } else {
            teamElement.textContent = '미배정';
        }
    }
    
    // 배정 시간
    const assignedTimeElement = document.getElementById('assigned-time');
    if (assignedTimeElement) {
        if (incident.assignedAt) {
            assignedTimeElement.textContent = new Date(incident.assignedAt).toLocaleString('ko-KR');
        } else {
            assignedTimeElement.textContent = '-';
        }
    }
    
    // 처리 결과
    const resolutionElement = document.getElementById('resolution');
    if (resolutionElement) {
        if (incident.resolution) {
            resolutionElement.innerHTML = `
                <div class="bg-green-900 p-4 rounded-lg">
                    <p class="text-sm text-gray-300">${incident.resolution.description || '처리 완료'}</p>
                    <p class="text-xs text-gray-400 mt-2">
                        처리 시간: ${new Date(incident.resolution.resolvedAt).toLocaleString('ko-KR')}
                    </p>
                </div>
            `;
        } else {
            resolutionElement.innerHTML = '<p class="text-gray-400">아직 처리되지 않음</p>';
        }
    }
}

// 라이다 이미지 업데이트
function updateLidarImage(incident) {
    const imageElement = document.getElementById('lidar-image');
    if (imageElement && incident.lidarImage) {
        imageElement.src = incident.lidarImage;
        imageElement.alt = `${incident.id} 라이다 이미지`;
    }
}

// 사건 타임라인 업데이트
function updateIncidentTimeline(incident, teams) {
    const timelineContainer = document.getElementById('incident-timeline');
    if (!timelineContainer) return;
    
    const timelineEvents = [];
    
    // 1. 경고 발생 시간 (항상 존재)
    if (incident.detectedAt || incident.timestamp) {
        timelineEvents.push({
            time: incident.detectedAt || incident.timestamp,
            title: '경고 발생',
            description: '라이다 센서에서 방치물품 감지',
            icon: 'fas fa-exclamation-triangle',
            color: 'red'
        });
    }
    
    // 2. 배정 시간 (배정된 경우)
    if (incident.assignedAt && incident.assignedTeam) {
        const team = teams.find(t => t.id === incident.assignedTeam);
        const teamName = team ? team.name : '감식팀';
        
        timelineEvents.push({
            time: incident.assignedAt,
            title: '팀 배정',
            description: `${teamName}에 배정됨`,
            icon: 'fas fa-user-plus',
            color: 'blue'
        });
    }
    
    // 3. 처리 완료 시간 (완료된 경우)
    if (incident.status === 'resolved' && incident.resolution && incident.resolution.resolvedAt) {
        timelineEvents.push({
            time: incident.resolution.resolvedAt,
            title: '처리 완료',
            description: incident.resolution.description || '현장 확인 및 처리 완료',
            icon: 'fas fa-check-circle',
            color: 'green'
        });
    }
    
    // 시간 순으로 정렬
    timelineEvents.sort((a, b) => new Date(a.time) - new Date(b.time));
    
    // 타임라인 HTML 생성
    let timelineHTML = '';
    
    if (timelineEvents.length === 0) {
        timelineHTML = `
            <div class="text-center text-gray-400 py-8">
                <i class="fas fa-info-circle mb-2"></i>
                <p>타임라인 정보가 없습니다</p>
            </div>
        `;
    } else {
        timelineEvents.forEach((event, index) => {
            const isLast = index === timelineEvents.length - 1;
            const eventTime = new Date(event.time);
            const formattedTime = eventTime.toLocaleString('ko-KR');
            const relativeTime = getRelativeTime(eventTime);
            
            timelineHTML += `
                <div class="flex items-start space-x-4">
                    <div class="flex flex-col items-center">
                        <div class="w-10 h-10 bg-${event.color}-100 border-2 border-${event.color}-300 rounded-full flex items-center justify-center">
                            <i class="${event.icon} text-${event.color}-600"></i>
                        </div>
                        ${!isLast ? `<div class="w-0.5 h-8 bg-gray-300 mt-2"></div>` : ''}
                    </div>
                    <div class="flex-1 pb-8">
                        <div class="flex items-center justify-between mb-1">
                            <h3 class="text-lg font-semibold text-gray-100">${event.title}</h3>
                            <span class="text-sm text-gray-400">${relativeTime}</span>
                        </div>
                        <p class="text-gray-400 mb-1">${event.description}</p>
                        <p class="text-xs text-gray-400">${formattedTime}</p>
                    </div>
                </div>
            `;
        });
    }
    
    timelineContainer.innerHTML = timelineHTML;
}

// 상대 시간 계산 함수
function getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return date.toLocaleDateString('ko-KR');
}

// 현장 사진 업데이트
function updateFieldPhotos(incident) {
    const photosContainer = document.getElementById('field-photos-container');
    if (!photosContainer) return;
    
    // incident 데이터에서 현장 사진 정보 가져오기
    let fieldPhotos = [];
    
    // 1. incident.fieldPhotos 배열에서 가져오기
    if (incident.fieldPhotos && Array.isArray(incident.fieldPhotos)) {
        fieldPhotos = incident.fieldPhotos;
    }
    
    // 2. incident.resolution에서 사진 정보 가져오기 (처리 완료 시)
    if (incident.resolution && incident.resolution.photos) {
        if (Array.isArray(incident.resolution.photos)) {
            fieldPhotos = fieldPhotos.concat(incident.resolution.photos);
        }
    }
    
    // 3. localStorage에서 모바일에서 업로드된 사진 정보 가져오기
    try {
        const taskPhotos = JSON.parse(localStorage.getItem('taskPhotos') || '[]');
        console.log('전체 taskPhotos:', taskPhotos);
        const incidentPhotos = taskPhotos.filter(photo => photo.taskId === incident.id);
        console.log(`${incident.id}에 해당하는 사진:`, incidentPhotos);
        
        if (incidentPhotos.length > 0) {
            const mobilePhotos = incidentPhotos.map(photo => ({
                url: photo.dataUrl,
                timestamp: photo.timestamp,
                description: `현장사진 (${new Date(photo.timestamp).toLocaleString('ko-KR')})`,
                source: 'mobile'
            }));
            fieldPhotos = fieldPhotos.concat(mobilePhotos);
            console.log('추가된 모바일 사진:', mobilePhotos);
        }
    } catch (error) {
        console.log('모바일 사진 로드 중 오류:', error);
    }
    
    console.log('최종 fieldPhotos:', fieldPhotos);
    
    let photosHTML = '';
    
    if (fieldPhotos.length === 0) {
        // 현장 사진이 없는 경우
        photosHTML = `
            <div class="text-center text-gray-400 py-8">
                <i class="fas fa-camera text-3xl mb-3 text-gray-300"></i>
                <p class="text-lg font-medium">현장 사진 없음</p>
                <p class="text-sm">아직 감식팀에서 현장 사진을 업로드하지 않았습니다.</p>
            </div>
        `;
    } else {
        // 사진이 있는 경우 그리드로 표시
        photosHTML = '<div class="grid grid-cols-2 md:grid-cols-3 gap-3">';
        
        fieldPhotos.forEach((photo, index) => {
            const photoUrl = typeof photo === 'string' ? photo : (photo && photo.url) || '';
            const photoCaption = typeof photo === 'object' && photo ? (photo.caption || photo.description || '') : '';
            const uploadTime = typeof photo === 'object' && photo && (photo.uploadedAt || photo.timestamp) ? 
                new Date(photo.uploadedAt || photo.timestamp).toLocaleString('ko-KR') : '';
            
            // 따옴표 이스케이프 처리
            const escapedPhotoUrl = photoUrl.replace(/'/g, "\\'");
            const escapedCaption = photoCaption.replace(/'/g, "\\'");
            const escapedUploadTime = uploadTime.replace(/'/g, "\\'");
            
            photosHTML += `
                <div class="relative group cursor-pointer" onclick="openPhotoModal('${escapedPhotoUrl}', '${escapedCaption}', '${escapedUploadTime}')">
                    <div class="aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
                        <img src="${photoUrl}" alt="현장 사진 ${index + 1}" 
                             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                             onerror="this.onerror=null; this.src='data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'200\\' viewBox=\\'0 0 200 200\\' fill=\\'none\\'%3E%3Crect width=\\'200\\' height=\\'200\\' fill=\\'%23F3F4F6\\' /%3E%3Ctext x=\\'100\\' y=\\'100\\' text-anchor=\\'middle\\' fill=\\'%239CA3AF\\' font-size=\\'16\\'%3E이미지 오류%3C/text%3E%3C/svg%3E'">
                    </div>
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200"></div>
                    <div class="absolute top-2 right-2 bg-gray-800 bg-opacity-80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <i class="fas fa-expand text-gray-300 text-sm"></i>
                    </div>
                    ${uploadTime ? `
                        <div class="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            ${uploadTime}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        photosHTML += '</div>';
        
        // 사진 정보 요약
        photosHTML += `
            <div class="mt-4 text-sm text-gray-400 text-center">
                총 <span class="font-semibold text-blue-600">${fieldPhotos.length}장</span>의 현장 사진이 등록되어 있습니다.
            </div>
        `;
    }
    
    photosContainer.innerHTML = photosHTML;
}

// 사진 모달 열기 (간단한 팝업)
function openPhotoModal(photoUrl, caption, uploadTime) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
    modal.onclick = () => modal.remove();
    
    modal.innerHTML = `
        <div class="max-w-4xl max-h-full p-4" onclick="event.stopPropagation()">
            <div class="bg-gray-800 rounded-lg overflow-hidden">
                <div class="p-4 border-b">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold">현장 사진</h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-300">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>
                <div class="relative">
                    <img src="${photoUrl}" alt="현장 사진 원본" class="w-full max-h-96 object-contain">
                </div>
                ${caption || uploadTime ? `
                    <div class="p-4 bg-gray-900">
                        ${caption ? `<p class="text-gray-200 mb-2">${caption}</p>` : ''}
                        ${uploadTime ? `<p class="text-sm text-gray-400">업로드 시간: ${uploadTime}</p>` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 팀 배정 함수
function assignTeam() {
    const urlParams = new URLSearchParams(window.location.search);
    const incidentId = urlParams.get('id');
    
    const teamSelect = document.createElement('select');
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    const availableTeams = teams.filter(t => t.status === 'available');
    
    if (availableTeams.length === 0) {
        alert('배정 가능한 팀이 없습니다.');
        return;
    }
    
    // 팀 선택 모달 표시 (간단한 버전)
    const teamId = prompt('팀 ID를 입력하세요:\n' + 
        availableTeams.map(t => `${t.id}: ${t.name}`).join('\n'));
    
    if (teamId) {
        const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
        const incidentIndex = incidents.findIndex(i => i.id === incidentId);
        
        if (incidentIndex !== -1) {
            incidents[incidentIndex].assignedTeam = teamId;
            incidents[incidentIndex].assignedAt = new Date().toISOString();
            incidents[incidentIndex].status = 'assigned';
            
            localStorage.setItem('incidents', JSON.stringify(incidents));
            
            // 팀 상태 업데이트
            const teamIndex = teams.findIndex(t => t.id === teamId);
            if (teamIndex !== -1) {
                teams[teamIndex].status = 'busy';
                teams[teamIndex].currentAssignment = incidentId;
                localStorage.setItem('teams', JSON.stringify(teams));
            }
            
            alert('팀이 배정되었습니다.');
            loadIncidentDetail(incidentId); // 페이지 새로고침
        }
    }
}

// 처리 완료 함수
function resolveIncident() {
    const urlParams = new URLSearchParams(window.location.search);
    const incidentId = urlParams.get('id');
    
    const description = prompt('처리 결과를 입력하세요:');
    
    if (description) {
        const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
        const incidentIndex = incidents.findIndex(i => i.id === incidentId);
        
        if (incidentIndex !== -1) {
            incidents[incidentIndex].status = 'resolved';
            incidents[incidentIndex].resolution = {
                description: description,
                resolvedAt: new Date().toISOString()
            };
            
            localStorage.setItem('incidents', JSON.stringify(incidents));
            
            // 팀 상태 업데이트
            if (incidents[incidentIndex].assignedTeam) {
                const teams = JSON.parse(localStorage.getItem('teams') || '[]');
                const teamIndex = teams.findIndex(t => t.id === incidents[incidentIndex].assignedTeam);
                
                if (teamIndex !== -1) {
                    teams[teamIndex].status = 'available';
                    teams[teamIndex].currentAssignment = null;
                    teams[teamIndex].totalResolved = (teams[teamIndex].totalResolved || 0) + 1;
                    localStorage.setItem('teams', JSON.stringify(teams));
                }
            }
            
            alert('사건이 처리 완료되었습니다.');
            window.location.href = 'incident-list.html';
        }
    }
}

// 목록으로 돌아가기
function goBack() {
    window.location.href = 'incident-list.html';
}

// 사진 모달 닫기
function closePhotoModal() {
    const modal = document.getElementById('photo-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}