// localStorage 기반 데이터 관리 시스템

class DataManager {
    constructor() {
        this.initializeData();
        this.migrateSessions();
    }
    
    // 기존 세션을 새로운 형태로 마이그레이션
    migrateSessions() {
        const oldSession = localStorage.getItem('currentSession');
        if (oldSession && oldSession !== 'null') {
            try {
                const session = JSON.parse(oldSession);
                if (session && !session.deviceType) {
                    // 기존 세션을 PC 세션으로 마이그레이션
                    session.deviceType = 'pc';
                    localStorage.setItem('currentSession_pc', JSON.stringify(session));
                    localStorage.removeItem('currentSession');
                }
            } catch (e) {
                // 기존 세션이 잘못된 형태면 제거
                localStorage.removeItem('currentSession');
            }
        }
    }

    // 데이터 완전 초기화 (사용자 호출용)
    resetAllData() {
        if (confirm('모든 데이터가 초기 상태로 리셋됩니다. 계속하시겠습니까?')) {
            localStorage.clear();
            this.createInitialData();
            alert('데이터가 초기화되었습니다. 페이지를 새로고침합니다.');
            window.location.reload();
        }
    }
    
    // 초기 데이터 생성
    createInitialData() {
        // 사용자 계정 데이터
        const users = [
            {
                id: 'USER-001',
                username: 'admin',
                password: 'admin123',
                name: '김관리',
                role: 'admin',
                department: '관제센터',
                email: 'admin@urielsoft.com',
                phone: '010-1234-5678',
                createdAt: '2025-01-01T09:00:00'
            },
            {
                id: 'USER-002',
                username: 'control',
                password: 'control123',
                name: '이관재',
                role: 'control',
                department: '관제센터',
                email: 'control@urielsoft.com',
                phone: '010-2345-6789',
                createdAt: '2025-01-01T09:00:00'
            },
            {
                id: 'USER-003',
                username: 'inspector1',
                password: 'insp123',
                name: '박감식',
                role: 'inspector',
                teamId: 'TEAM-001',
                department: '감식1팀',
                email: 'team1@urielsoft.com',
                phone: '010-3456-7890',
                createdAt: '2025-01-02T09:00:00'
            },
            {
                id: 'USER-004',
                username: 'inspector2',
                password: 'insp123',
                name: '최감식',
                role: 'inspector',
                teamId: 'TEAM-001',
                department: '감식1팀',
                email: 'member1@urielsoft.com',
                phone: '010-4567-8901',
                createdAt: '2025-01-02T10:00:00'
            },
            {
                id: 'USER-005',
                username: 'inspector3',
                password: 'insp223',
                name: '정감식',
                role: 'inspector',
                teamId: 'TEAM-002',
                department: '감식2팀',
                email: 'team2@urielsoft.com',
                phone: '010-5678-9012',
                createdAt: '2025-01-02T09:00:00'
            }
        ];
        localStorage.setItem('users', JSON.stringify(users));
        
        // 감식팀 데이터
        const teams = [
            {
                id: 'TEAM-001',
                name: '감식 1팀',
                leader: 'USER-003',
                members: ['USER-003', 'USER-004'],
                status: 'busy',
                currentAssignment: 'INC-2025-002',
                totalResolved: 0,
                createdAt: '2025-01-02T09:00:00'
            },
            {
                id: 'TEAM-002',
                name: '감식 2팀',
                leader: 'USER-005',
                members: ['USER-005'],
                status: 'busy',
                currentAssignment: 'INC-2025-003',
                totalResolved: 0,
                createdAt: '2025-01-02T09:00:00'
            }
        ];
        localStorage.setItem('teams', JSON.stringify(teams));
        
        // 방치물품 초기 데이터 (현재 날짜 기준)
        const now = new Date();
        const today = new Date(now);
        
        // 시간 계산 헬퍼 함수
        const getTimeString = (offsetMinutes) => {
            const time = new Date(today.getTime() + (offsetMinutes * 60000));
            return time.toISOString();
        };
        
        const incidents = [
            {
                id: 'INC-2025-001',
                location: 'Gate A-3',
                zone: 'A구역',
                objectType: '캐리어',
                objectColor: '검정색',
                objectSize: '대형',
                detectedAt: getTimeString(-60), // 1시간 전
                duration: 60,
                status: 'pending',
                riskLevel: 'high',
                assignedTeam: null,
                assignedAt: null,
                assignedBy: null,
                lidarImage: '/image/라이다평면도.jfif',
                aiAnalysis: {
                    objectType: 'luggage',
                    confidence: 0.92,
                    riskScore: 8.5,
                    suspiciousFeatures: ['unattended', 'large_size', 'near_crowded_area']
                },
                resolution: null
            },
            {
                id: 'INC-2025-002',
                location: 'Gate B-1',
                zone: 'B구역',
                objectType: '백팩',
                objectColor: '파란색',
                objectSize: '중형',
                detectedAt: getTimeString(-45), // 45분 전
                duration: 45,
                status: 'assigned',
                riskLevel: 'medium',
                assignedTeam: 'TEAM-001',
                assignedAt: getTimeString(-30), // 30분 전 배정
                assignedBy: 'USER-002',
                lidarImage: '/image/평면도.png',
                aiAnalysis: {
                    objectType: 'backpack',
                    confidence: 0.88,
                    riskScore: 6.2,
                    suspiciousFeatures: ['unattended', 'medium_duration']
                },
                resolution: null
            },
            {
                id: 'INC-2025-003',
                location: '수하물 찾는 곳',
                zone: 'C구역',
                objectType: '쇼핑백',
                objectColor: '흰색',
                objectSize: '소형',
                detectedAt: getTimeString(-30), // 30분 전
                duration: 30,
                status: 'in_progress',
                riskLevel: 'low',
                assignedTeam: 'TEAM-002',
                assignedAt: getTimeString(-20), // 20분 전 배정
                assignedBy: 'USER-002',
                lidarImage: '/image/평면도.png',
                aiAnalysis: {
                    objectType: 'shopping_bag',
                    confidence: 0.95,
                    riskScore: 3.1,
                    suspiciousFeatures: ['unattended']
                },
                resolution: null
            },
            {
                id: 'INC-2025-004',
                location: 'Gate C-2',
                zone: 'C구역',
                objectType: '서류가방',
                objectColor: '갈색',
                objectSize: '중형',
                detectedAt: getTimeString(-120), // 2시간 전
                duration: 45,
                status: 'resolved',
                riskLevel: 'medium',
                assignedTeam: 'TEAM-001',
                assignedAt: getTimeString(-105), // 1시간 45분 전 배정
                assignedBy: 'USER-002',
                lidarImage: '/image/평면도.png',
                aiAnalysis: {
                    objectType: 'briefcase',
                    confidence: 0.91,
                    riskScore: 5.8,
                    suspiciousFeatures: ['unattended', 'business_hours']
                },
                resolution: {
                    description: '단순 분실물로 확인되어 처리 완료',
                    resolvedAt: getTimeString(-75), // 1시간 15분 전 처리완료
                    type: 'lost'
                }
            },
            {
                id: 'INC-2025-005',
                location: '면세점 앞',
                zone: 'A구역',
                objectType: '쇼핑백',
                objectColor: '검정색',
                objectSize: '소형',
                detectedAt: getTimeString(-180), // 3시간 전
                duration: 35,
                status: 'resolved',
                riskLevel: 'low',
                assignedTeam: 'TEAM-002',
                assignedAt: getTimeString(-165), // 2시간 45분 전 배정
                assignedBy: 'USER-002',
                lidarImage: '/image/평면도.png',
                aiAnalysis: {
                    objectType: 'shopping_bag',
                    confidence: 0.89,
                    riskScore: 2.5,
                    suspiciousFeatures: ['unattended']
                },
                resolution: {
                    description: '오탐지로 확인됨',
                    resolvedAt: getTimeString(-145), // 2시간 25분 전 처리완료
                    type: 'false'
                }
            }
        ];
        localStorage.setItem('incidents', JSON.stringify(incidents));
        
        // 세션 초기화
        localStorage.setItem('currentSession', JSON.stringify(null));
    }
    
    // 초기 데이터 셋업 (자동 실행용)
    initializeData() {
        // 사용자 계정이 없으면 초기 데이터 생성
        if (!localStorage.getItem('users')) {
            this.createInitialData();
        }
    }

    // 로그인 처리 (비밀번호 체크 없이 아이디만으로 로그인)
    // 디바이스 타입 감지
    getDeviceType() {
        // URL 경로로 모바일 여부 판단
        if (window.location.pathname.includes('/mobile/')) {
            return 'mobile';
        }
        return 'pc';
    }
    
    // 세션 키 생성
    getSessionKey() {
        return `currentSession_${this.getDeviceType()}`;
    }

    login(username, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username);
        
        if (user) {
            const session = {
                userId: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                department: user.department,
                teamId: user.teamId || null,
                loginTime: new Date().toISOString(),
                deviceType: this.getDeviceType()
            };
            localStorage.setItem(this.getSessionKey(), JSON.stringify(session));
            return { success: true, user: session };
        }
        return { success: false, message: '존재하지 않는 아이디입니다.' };
    }

    // 로그아웃
    logout() {
        localStorage.setItem(this.getSessionKey(), JSON.stringify(null));
    }

    // 현재 로그인한 사용자 정보
    getCurrentUser() {
        return JSON.parse(localStorage.getItem(this.getSessionKey()) || 'null');
    }

    // 방치물품 목록 조회
    getIncidents(filter = {}) {
        let incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
        
        // 필터링 적용
        if (filter.status) {
            incidents = incidents.filter(i => i.status === filter.status);
        }
        if (filter.riskLevel) {
            incidents = incidents.filter(i => i.riskLevel === filter.riskLevel);
        }
        if (filter.assignedTeam) {
            incidents = incidents.filter(i => i.assignedTeam === filter.assignedTeam);
        }
        
        // 최신 순으로 정렬
        incidents.sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt));
        
        return incidents;
    }

    // 감식팀 목록 조회
    getTeams() {
        return JSON.parse(localStorage.getItem('teams') || '[]');
    }

    // 감식팀 배정
    assignTeam(incidentId, teamId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return { success: false, message: '로그인이 필요합니다.' };

        let incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
        let teams = JSON.parse(localStorage.getItem('teams') || '[]');
        
        const incidentIndex = incidents.findIndex(i => i.id === incidentId);
        const teamIndex = teams.findIndex(t => t.id === teamId);
        
        if (incidentIndex === -1) return { success: false, message: '방치물품을 찾을 수 없습니다.' };
        if (teamIndex === -1) return { success: false, message: '감식팀을 찾을 수 없습니다.' };
        
        // 방치물품 업데이트
        incidents[incidentIndex].status = 'assigned';
        incidents[incidentIndex].assignedTeam = teamId;
        incidents[incidentIndex].assignedAt = new Date().toISOString();
        incidents[incidentIndex].assignedBy = currentUser.userId;
        
        // 팀 상태 업데이트
        teams[teamIndex].status = 'busy';
        teams[teamIndex].currentAssignment = incidentId;
        
        localStorage.setItem('incidents', JSON.stringify(incidents));
        localStorage.setItem('teams', JSON.stringify(teams));
        
        // storage 이벤트 발생 (다른 탭에서 감지)
        window.dispatchEvent(new Event('storage'));
        
        return { success: true, message: '감식팀이 배정되었습니다.' };
    }

    // 처리 결과 업로드
    uploadResolution(incidentId, resolution) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return { success: false, message: '로그인이 필요합니다.' };

        let incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
        let teams = JSON.parse(localStorage.getItem('teams') || '[]');
        
        const incidentIndex = incidents.findIndex(i => i.id === incidentId);
        if (incidentIndex === -1) return { success: false, message: '방치물품을 찾을 수 없습니다.' };
        
        const incident = incidents[incidentIndex];
        const teamIndex = teams.findIndex(t => t.id === incident.assignedTeam);
        
        // 방치물품 해결 처리
        incidents[incidentIndex].status = 'resolved';
        incidents[incidentIndex].resolution = {
            resolvedAt: new Date().toISOString(),
            resolvedBy: currentUser.userId,
            resolvedByName: currentUser.name,
            isSafe: resolution.isSafe,
            description: resolution.description,
            photo: resolution.photo || null,
            actionTaken: resolution.actionTaken
        };
        
        // 팀 상태 업데이트
        if (teamIndex !== -1) {
            teams[teamIndex].status = 'available';
            teams[teamIndex].currentAssignment = null;
            teams[teamIndex].totalResolved++;
        }
        
        localStorage.setItem('incidents', JSON.stringify(incidents));
        localStorage.setItem('teams', JSON.stringify(teams));
        
        // storage 이벤트 발생
        window.dispatchEvent(new Event('storage'));
        
        return { success: true, message: '처리 결과가 업로드되었습니다.' };
    }

    // 통계 데이터 생성
    getStatistics() {
        const incidents = this.getIncidents();
        const teams = this.getTeams();
        
        const today = new Date().toDateString();
        const todayIncidents = incidents.filter(i => 
            new Date(i.detectedAt).toDateString() === today
        );
        
        return {
            total: incidents.length,
            todayTotal: todayIncidents.length,
            pending: incidents.filter(i => i.status === 'pending').length,
            assigned: incidents.filter(i => i.status === 'assigned').length,
            resolved: incidents.filter(i => i.status === 'resolved').length,
            highRisk: incidents.filter(i => i.riskLevel === 'high').length,
            mediumRisk: incidents.filter(i => i.riskLevel === 'medium').length,
            lowRisk: incidents.filter(i => i.riskLevel === 'low').length,
            averageResponseTime: this.calculateAverageResponseTime(incidents),
            teamPerformance: teams.map(t => ({
                name: t.name,
                resolved: t.totalResolved,
                status: t.status
            }))
        };
    }

    // 평균 대응 시간 계산
    calculateAverageResponseTime(incidents) {
        const resolved = incidents.filter(i => i.resolution);
        if (resolved.length === 0) return 0;
        
        const totalMinutes = resolved.reduce((sum, i) => {
            const detected = new Date(i.detectedAt);
            const resolved = new Date(i.resolution.resolvedAt);
            return sum + (resolved - detected) / 60000; // 분 단위
        }, 0);
        
        return Math.round(totalMinutes / resolved.length);
    }
}

// 전역 객체로 생성
window.dataManager = new DataManager();

// 전역 함수로 등록 (브라우저 콘솔에서 사용 가능)
window.resetAllData = () => window.dataManager.resetAllData();