const DEAD_ZONE = 6;
const DRAG_THRESHOLD = 8;
const LONG_PRESS_MS = 350;
const DOUBLE_TAP_MS = 250;
const OUTER_BUTTON_DEAD_ZONE = 5;

class HaromaKeyboard {
    constructor(options) {
        this.display = document.getElementById(options.displayId);
        this.displayContainer = document.getElementById(options.displayContainerId);
        this.keyboardContainer = document.getElementById(options.keyboardContainerId);
        this.layerButtons = document.querySelectorAll(options.layerButtonSelector);
        this.settingsModal = document.getElementById(options.settingsModalId);

        // 한글 조합 규칙 상수
        this.CHOSUNG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
        this.JUNGSUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
        this.JONGSUNG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
        this.DOUBLE_FINAL = {'ㄱㅅ':'ㄳ','ㄴㅈ':'ㄵ','ㄴㅎ':'ㄶ','ㄹㄱ':'ㄺ','ㄹㅁ':'ㄻ','ㄹㅂ':'ㄼ','ㄹㅅ':'ㄽ','ㄹㅌ':'ㄾ','ㄹㅍ':'ㄿ','ㄹㅎ':'ㅀ','ㅂㅅ':'ㅄ'};
        this.REVERSE_DOUBLE_FINAL = Object.fromEntries(Object.entries(this.DOUBLE_FINAL).map(([key, val]) => [val, key.split('')]));
		this.REVERSE_COMPLEX_VOWEL = {'ㅙ':'ㅘ','ㅘ':'ㅗ','ㅚ':'ㅗ','ㅞ':'ㅝ','ㅝ':'ㅜ','ㅟ':'ㅜ','ㅢ':'ㅡ','ㅐ':'ㅏ','ㅒ':'ㅑ','ㅔ':'ㅓ','ㅖ':'ㅕ'};
		this.COMPLEX_VOWEL = {'ㅗㅣ':'ㅚ','ㅗㅏ':'ㅘ','ㅘㅣ':'ㅙ','ㅜㅣ':'ㅟ','ㅜㅓ':'ㅝ','ㅝㅣ':'ㅞ','ㅡㅣ':'ㅢ','ㅓㅣ':'ㅔ','ㅕㅣ':'ㅖ','ㅏㅣ':'ㅐ','ㅑㅣ':'ㅒ'};
		
		this.HANGUL_TO_QWERTY = {
            'ㄱ': 'r', 'ㄲ': 'R', 'ㄴ': 's', 'ㄷ': 'e', 'ㄸ': 'E', 'ㄹ': 'f',
            'ㅁ': 'a', 'ㅂ': 'q', 'ㅃ': 'Q', 'ㅅ': 't', 'ㅆ': 'T', 'ㅇ': 'd',
            'ㅈ': 'w', 'ㅉ': 'W', 'ㅊ': 'c', 'ㅋ': 'z', 'ㅌ': 'x', 'ㅍ': 'v', 'ㅎ': 'g',
            'ㅏ': 'k', 'ㅐ': 'o', 'ㅑ': 'i', 'ㅒ': 'O', 'ㅓ': 'j', 'ㅔ': 'p',
            'ㅕ': 'u', 'ㅖ': 'P', 'ㅗ': 'h', 'ㅛ': 'y', 'ㅜ': 'n', 'ㅠ': 'b',
            'ㅡ': 'm', 'ㅣ': 'l',
            'ㄳ': 'rt', 'ㄵ': 'sw', 'ㄶ': 'sg', 'ㄺ': 'rf', 'ㄻ': 'ra', 'ㄼ': 'rq',
            'ㄽ': 'rt', 'ㄾ': 'rx', 'ㄿ': 'rv', 'ㅀ': 'rg', 'ㅄ': 'qt',
            'ㅘ': 'hk', 'ㅙ': 'ho', 'ㅚ': 'hl', 'ㅝ': 'nj', 'ㅞ': 'np', 'ㅟ': 'nl', 'ㅢ': 'ml'
        };
		
        // KR 레이어 드래그 맵
        this.VOWEL_DRAG_MAP = {'ㅇ':'ㅏ','ㄷ':'ㅓ','ㅅ':'ㅗ','ㅂ':'ㅜ','ㄱ':'ㅣ','ㅈ':'ㅣ','ㄴ':'ㅡ','ㅁ':'ㅡ'};
        this.IOTIZED_VOWEL_MAP = {'ㅏ':'ㅑ','ㅓ':'ㅕ','ㅗ':'ㅛ','ㅜ':'ㅠ','ㅡ':'ㅢ','ㅣ':'ㅢ'};
        this.COMPOUND_VOWEL_MAP = {'ㅏ':{'ㄱ':'ㅒ','ㅁ':'ㅐ'},'ㅓ':{'ㅈ':'ㅖ','ㄴ':'ㅔ'},'ㅗ':{'ㄱ':'ㅘ','ㅈ':'ㅚ'},'ㅜ':{'ㅁ':'ㅟ','ㄴ':'ㅝ'},'ㅘ':{'ㅇ':'ㅙ'},'ㅝ':{'ㄷ':'ㅞ'}};
		
		// EN 레이어 드래그 맵
		this.EN_DRAG_MAP = {'h':'a','d':'e','s':'o','b':'u','n':'y','g':'i'};
		
        this.state = {
            lastCharInfo: null, 
			capsLock: false, 
			scale: 1.0, 
            rotation: 0, 
			activeLayer: 'KR',
			isQwertyOutput: false,
            isPointerDown: false, 
			pointerMoved: false, 
			clickTimeout: null,
            horizontalOffset: 0, 
			verticalOffset: 0, 
			pointerOwnerEl: null,			
            dragState: { 
				isActive: false, 
				conceptualVowel: null, 
				lastOutput: null, 
				isEnDrag: false, 
				startX: 0, 
				startY: 0 
			},
			tapState: { 
				lastTapAt: 0, 
				longPressFired: false, 
				centerPressed: false, 
				centerDragHasExited: false 
			},
            pendingSingleTap: null
        };
        this.init();
    }

    flushPendingTap() { 
		if (this.state.pendingSingleTap) { 
			clearTimeout(this.state.pendingSingleTap.timerId); 
			this.state.pendingSingleTap.action(); 
			this.state.pendingSingleTap = null; 
		} 
	}
	
    cancelPendingTap() { 
		if (this.state.pendingSingleTap) { 
			clearTimeout(this.state.pendingSingleTap.timerId); 
			this.state.pendingSingleTap = null; 
		} 
	}
	
    init() { 
		this.loadSettings(); 
		this.attachEventListeners();
	}
	
    loadSettings() { 
		const savedScale = localStorage.getItem('keyboardScale'); 
		if (savedScale) this.state.scale = parseFloat(savedScale); 
		const savedHorizontalOffset = localStorage.getItem('keyboardHorizontalOffset'); 
		if (savedHorizontalOffset) { 
			this.state.horizontalOffset = parseInt(savedHorizontalOffset, 10); 
			this.applyHorizontalPosition(); 
		} 
		const savedVerticalOffset = localStorage.getItem('keyboardVerticalOffset'); 
		if (savedVerticalOffset) { 
			this.state.verticalOffset = parseInt(savedVerticalOffset, 10); 
		} 
        // 2. 페이지 로드 시 저장된 회전 각도 불러오기
        const savedRotation = localStorage.getItem('keyboardRotation');
        if (savedRotation) {
            this.state.rotation = parseInt(savedRotation, 10);
        }
		this.applyKeyboardTransform(); 
	}

	attachEventListeners() {
		let lastHoveredKey = null;
		const isInCenter = (x, y) => { 
			const el = document.elementFromPoint(x, y); 
			return !!(el && el.closest('.octagon-center')); 
		};
		const setupDragListener = (layerName, isEn = false) => {
			const layer = document.querySelector(`.layer[data-layer="${layerName}"]`);
			if (!layer) return;
			const centerOctagon = layer.querySelector('.octagon-center');
			if (!centerOctagon) return;
			centerOctagon.addEventListener('pointerdown', e => {
				this.state.tapState.centerPressed = true; 
				this.state.tapState.longPressFired = false; 
				this.state.tapState.centerDragHasExited = false;
				this.state.dragState = { 
					isActive: true, 
					startX: e.clientX, 
					startY: e.clientY, 
				};
				clearTimeout(this._centerLongTimer);
				this._centerLongTimer = setTimeout(() => {
					if (!this.state.dragState.isActive || !this.state.tapState.centerPressed) return;
					const textToCommit = '\n';
					if (window.Android && typeof window.Android.sendKeyToNative === 'function') {
						window.Android.sendKeyToNative(textToCommit);
					} else {
						this.insertAtCursor(textToCommit);
					}
					this.resetComposition(); 
					this.state.tapState.longPressFired = true;
				}, LONG_PRESS_MS);
				if (this.state.activeLayer !== layerName) return;
				this.state.dragState = { 
					isActive: true, 
					conceptualVowel: null, 
					lastOutput: null, 
					isEnDrag: isEn, 
					startX: e.clientX, 
					startY: e.clientY 
				};
				this.state.pointerMoved = false; 
				lastHoveredKey = centerOctagon; e.preventDefault();
			});
		}; 
    
		setupDragListener('KR');
		setupDragListener('EN', true);
		setupDragListener('SYM');
		setupDragListener('NUM');
    
		document.addEventListener('pointermove', e => {
			const dx = e.clientX - this.state.dragState.startX; 
			const dy = e.clientY - this.state.dragState.startY; 
			const movedDist = Math.hypot(dx, dy);
        
			if (this.state.dragState.isActive && movedDist > DRAG_THRESHOLD) { 
				this.flushPendingTap(); 
			}
			if (!this.state.dragState.isActive || !this.state.tapState.centerPressed) return;
			if (!this.state.tapState.centerDragHasExited && !isInCenter(e.clientX, e.clientY)) { 
				this.state.tapState.centerDragHasExited = true; 
			}
			if (movedDist > DRAG_THRESHOLD) { 
				clearTimeout(this._centerLongTimer); 
			}
			const currentElement = document.elementFromPoint(e.clientX, e.clientY); 
			if (!currentElement) return;
			const targetKey = currentElement.closest('[data-click]'); 
			if (!targetKey || targetKey === lastHoveredKey) return;
			lastHoveredKey = targetKey;

			// --- ▼▼▼ [핵심 수정] KR과 KE 모드 로직을 완전히 통합! ▼▼▼ ---
			if (this.state.activeLayer === 'KR') {
				// isQwertyOutput을 여기서 신경 쓸 필요 없이, 항상 한글 조합 로직을 따른다.
				if (targetKey.classList.contains('octagon-center')) {
					const { conceptualVowel } = this.state.dragState;
					if (conceptualVowel) {
						const newVowel = this.IOTIZED_VOWEL_MAP[conceptualVowel];
						if (newVowel) { this.updateSyllable(newVowel); }
					}
				} else {
					const consonant = targetKey.dataset.click;
					if (!this.state.dragState.conceptualVowel) {
						const newVowel = this.VOWEL_DRAG_MAP[consonant];
						if (newVowel) { this.handleInput(newVowel); }
					} else {
						const compoundMap = this.COMPOUND_VOWEL_MAP[this.state.dragState.conceptualVowel];
						if (compoundMap && compoundMap[consonant]) {
							const newVowel = compoundMap[consonant];
							this.updateSyllable(newVowel);
						}
					}
				}
			}
			// --- ▲▲▲ 로직 통합 완료 ▲▲▲ ---
			else if (this.state.activeLayer === 'EN') {
				if (!targetKey.classList.contains('octagon-center')) {
					const keyIdentifier = targetKey.dataset.click; 
					const charToInput = this.EN_DRAG_MAP[keyIdentifier];
					if (charToInput) { 
						this.handleInput(charToInput); 
						this.state.dragState.isActive = false; 
						this.state.tapState.centerPressed = false; 
					}
				}
			}
		});

		// pointerup 리스너는 기존과 동일하게 유지
		document.addEventListener('pointerup', e => {
			if (!this.state.dragState.isActive) return;
			if (this.state.tapState.centerPressed) {
				const dx = e.clientX - this.state.dragState.startX; 
				const dy = e.clientY - this.state.dragState.startY; 
				const movedDist = Math.hypot(dx, dy);
				clearTimeout(this._centerLongTimer);
				if (!this.state.tapState.longPressFired) {
					if (movedDist <= DEAD_ZONE) {
						const now = Date.now();
						const doubleTapAction = () => {
							let textToCommit = '.';
							if (this.state.activeLayer === 'NUM') { 
								textToCommit = '0';
							} else { 
								const cur = this.display.selectionStart; 
								const hasSpaceBefore = cur > 0 && this.display.value[cur - 1] === ' '; 
								if (hasSpaceBefore) {
									if (window.Android && typeof window.Android.replaceTextBeforeCursor === 'function') {
										window.Android.replaceTextBeforeCursor(1, '.');
									} else {
										this.replaceTextBeforeCursor(1, '.'); 
									}
									textToCommit = null;
								}
							}
							if (textToCommit) {
								if (window.Android && typeof window.Android.sendKeyToNative === 'function') {
									window.Android.sendKeyToNative(textToCommit);
								} else {
									this.insertAtCursor(textToCommit);
								}
							}
							this.resetComposition();
						};
						const singleTapAction = () => {
							let charToInsert = ' '; 
							if (this.state.activeLayer === 'SYM') { 
								charToInsert = '?';
							} else if (this.state.activeLayer === 'NUM') { 
								charToInsert = '5'; 
							}
							if (window.Android && typeof window.Android.sendKeyToNative === 'function') {
								window.Android.sendKeyToNative(charToInsert);
							} else {
								this.insertAtCursor(charToInsert);
							}
							this.resetComposition();
						};
						if (now - this.state.tapState.lastTapAt <= DOUBLE_TAP_MS) { 
							this.cancelPendingTap(); 
							doubleTapAction(); 
							this.state.tapState.lastTapAt = 0;
						} else { 
							this.state.tapState.lastTapAt = now; 
							const timerId = setTimeout(() => { 
								singleTapAction(); 
								this.state.pendingSingleTap = null; }, 
								DOUBLE_TAP_MS); 
							this.state.pendingSingleTap = { timerId, action: singleTapAction }; 
						}
					} else {
						if (!this.state.tapState.centerDragHasExited && isInCenter(e.clientX, e.clientY)) {
							let textToCommit = ',';
							if (this.state.activeLayer === 'NUM') { 
								textToCommit = '0';
							}
							if (window.Android && typeof window.Android.sendKeyToNative === 'function') {
								window.Android.sendKeyToNative(textToCommit);
							} else {
								this.insertAtCursor(textToCommit); 
							}
							this.resetComposition();
						}
					}
				}
				this.state.tapState.centerPressed = false;
			}
			this.state.dragState.isActive = false;
		});
		this.attachRemainingListeners();
	}

	updateSyllable(newVowel) {
		// KE 모드일 때, 이전에 조합된 글자의 QWERTY 문자열 길이를 계산하는 내부 함수
		const getLastQwertyLength = () => {
			const last = this.state.lastCharInfo;
			// [수정] 'KE'가 아닌 isQwertyOutput을 확인
			if (!this.state.isQwertyOutput || !last) return 1; 
        
			let lastHangul = '';
			if (last.type === 'CV') {
				lastHangul = this.combineCode(last.cho, last.jung);
			} else {
				lastHangul = this.state.dragState.conceptualVowel || '';
			}
			return this.convertToQwerty(lastHangul).length || 1;
		};

		// 자음+모음이 결합된 상태에서 모음이 변경될 경우 (예: '고' -> '과')
		if (this.state.lastCharInfo && this.state.lastCharInfo.type === 'CV') {
			const cho = this.state.lastCharInfo.cho;
			const newChar = this.combineCode(cho, newVowel);
        
			// [수정] 'KE'가 아닌 isQwertyOutput을 확인
			const finalText = this.state.isQwertyOutput ? this.convertToQwerty(newChar) : newChar;
			const removeLength = getLastQwertyLength();
        
			this.replaceTextBeforeCursor(removeLength, finalText);
			this.state.lastCharInfo = { type: 'CV', cho: cho, jung: newVowel };

		// 모음만 단독으로 변경될 경우 (예: 'ㅏ' -> 'ㅑ')
		} else {
			// [수정] 'KE'가 아닌 isQwertyOutput을 확인
			const finalText = this.state.isQwertyOutput ? this.convertToQwerty(newVowel) : newVowel;
			const removeLength = getLastQwertyLength();
        
			this.replaceTextBeforeCursor(removeLength, finalText);
			this.resetComposition();
		}
    
		// 현재 조합된 모음을 상태에 저장
		this.state.dragState.conceptualVowel = newVowel;
	}

    handleInput(char) {
    if (typeof char !== 'string' || !char.trim() && char !== ' ') return;
    const isHangulComponent = this.CHOSUNG.includes(char) || this.JUNGSUNG.includes(char);
    if (this.state.activeLayer === 'KR' && isHangulComponent) {
		this.composeHangul(char);
    } else {
        this.resetComposition();
        let charToInsert = char;
        if (this.state.activeLayer === 'EN' && this.state.capsLock && /^[a-z]$/.test(char)) {
            charToInsert = char.toUpperCase();
        }
        this.insertAtCursor(charToInsert);
    }
}
	
    composeHangul(char) {
		const last = this.state.lastCharInfo;
		const isChosung = this.CHOSUNG.includes(char);
		const isJungsung = this.JUNGSUNG.includes(char);
		if (this.display.selectionStart !== this.display.selectionEnd) this.resetComposition();

		const getLastQwertyLength = () => {
			if (!last) return 0;
			let lastHangul = '';
			if (last.type === 'C') lastHangul = last.cho;
			else if (last.type === 'V') lastHangul = last.jung;
			else if (last.type === 'CV') lastHangul = this.combineCode(last.cho, last.jung);
			else if (last.type === 'CVJ') lastHangul = this.combineCode(last.cho, last.jung, last.jong);
			return this.convertToQwerty(lastHangul).length;
		};

		if (isChosung) {
			// 경우 1: '가' + 'ㄱ' -> '각'
			if (last && last.type === 'CV' && this.JONGSUNG.includes(char)) {
				const newChar = this.combineCode(last.cho, last.jung, char);
				const finalText = this.state.isQwertyOutput ? this.convertToQwerty(newChar) : newChar; // <--- 확인 완료
				const removeLength = this.state.isQwertyOutput ? getLastQwertyLength() : 1;
            
				this.replaceTextBeforeCursor(removeLength, finalText);
				this.state.lastCharInfo = { type: 'CVJ', cho: last.cho, jung: last.jung, jong: char };
    
			// 경우 2: '각' + 'ㅅ' -> '값'
			} else if (last && last.type === 'CVJ' && this.DOUBLE_FINAL[last.jong + char]) {
				const newJong = this.DOUBLE_FINAL[last.jong + char];
				const newChar = this.combineCode(last.cho, last.jung, newJong);
				const finalText = this.state.isQwertyOutput ? this.convertToQwerty(newChar) : newChar; // <--- 확인 완료
				const removeLength = this.state.isQwertyOutput ? getLastQwertyLength() : 1;

				this.replaceTextBeforeCursor(removeLength, finalText);
				this.state.lastCharInfo = { type: 'CVJ', cho: last.cho, jung: last.jung, jong: newJong };
    
			// 경우 3: 새로운 글자 시작
			} else {
				this.resetComposition();
				// [수정됨] newChar가 아닌 char를 사용해야 함
				const finalText = this.state.isQwertyOutput ? this.convertToQwerty(char) : char; 
				this.insertAtCursor(finalText);
				this.state.lastCharInfo = { type: 'C', cho: char };
				this.state.dragState.conceptualVowel = null;
			}
		} else if (isJungsung) {
			// 경우 1: 'ㅗ' + 'ㅏ' -> 'ㅘ'
			if (last && (last.type === 'V' || last.type === 'CV') && this.COMPLEX_VOWEL[last.jung + char]) {
				const newVowel = this.COMPLEX_VOWEL[last.jung + char];
				if (last.type === 'CV') {
					const newChar = this.combineCode(last.cho, newVowel);
					const finalText = this.state.isQwertyOutput ? this.convertToQwerty(newChar) : newChar; // <--- 확인 완료
					const removeLength = this.state.isQwertyOutput ? getLastQwertyLength() : 1;
					this.replaceTextBeforeCursor(removeLength, finalText);
					this.state.lastCharInfo = { type: 'CV', cho: last.cho, jung: newVowel };
				} else { // last.type === 'V'
					// [수정됨] isQwertyOutput을 사용하도록 변경
					const finalText = this.state.isQwertyOutput ? this.convertToQwerty(newVowel) : newVowel;
					const removeLength = this.state.isQwertyOutput ? getLastQwertyLength() : 1;
					this.replaceTextBeforeCursor(removeLength, finalText);
					this.state.lastCharInfo = { type: 'V', jung: newVowel };
				}
			// 경우 2: 'ㄱ' + 'ㅏ' -> '가'
			} else if (last && last.type === 'C') {
				const newChar = this.combineCode(last.cho, char);
				const finalText = this.state.isQwertyOutput ? this.convertToQwerty(newChar) : newChar; // <--- 확인 완료
				const removeLength = this.state.isQwertyOutput ? getLastQwertyLength() : 1;
				this.replaceTextBeforeCursor(removeLength, finalText);
				this.state.lastCharInfo = { type: 'CV', cho: last.cho, jung: char };

			// 경우 3: '값' + 'ㅏ' -> '가바'
			} else if (last && last.type === 'CVJ') {
				const doubleJong = this.REVERSE_DOUBLE_FINAL[last.jong];
				let char1, char2;
				if (doubleJong) {
					char1 = this.combineCode(last.cho, last.jung, doubleJong[0]);
					char2 = this.combineCode(doubleJong[1], char);
					this.state.lastCharInfo = { type: 'CV', cho: doubleJong[1], jung: char };
				} else {
					char1 = this.combineCode(last.cho, last.jung);
					char2 = this.combineCode(last.jong, char);
					this.state.lastCharInfo = { type: 'CV', cho: last.jong, jung: char };
				}
				// [수정됨] isQwertyOutput을 사용하도록 변경
				const finalText = this.state.isQwertyOutput ? this.convertToQwerty(char1 + char2) : (char1 + char2);
				const removeLength = this.state.isQwertyOutput ? getLastQwertyLength() : 1;
				this.replaceTextBeforeCursor(removeLength, finalText);
			// 경우 4: 새로운 모음만 입력
			} else {
				this.resetComposition();
				// [수정됨] newChar가 아닌 char를 사용해야 함
				const finalText = this.state.isQwertyOutput ? this.convertToQwerty(char) : char;
				this.insertAtCursor(finalText);
				this.state.lastCharInfo = { type: 'V', jung: char };
			}
			this.state.dragState.conceptualVowel = char;
		}
	}
	
    combineCode(cho, jung, jong = '') { 
		const ci = this.CHOSUNG.indexOf(cho); 
		const ji = this.JUNGSUNG.indexOf(jung); 
		const joi = this.JONGSUNG.indexOf(jong); 
		if (ci < 0 || ji < 0) return cho + (jung || '') + (jong || ''); 
		return String.fromCharCode(0xAC00 + (ci * 21 + ji) * 28 + joi); 
	}
    
	convertToQwerty(hangul) {
		let result = '';
		for (const char of hangul) {
			if (char >= '가' && char <= '힣') {
				const unicode = char.charCodeAt(0) - 0xAC00;
				const choIndex = Math.floor(unicode / (21 * 28));
				const jungIndex = Math.floor((unicode % (21 * 28)) / 28);
				const jongIndex = unicode % 28;

				result += this.HANGUL_TO_QWERTY[this.CHOSUNG[choIndex]] || '';
				result += this.HANGUL_TO_QWERTY[this.JUNGSUNG[jungIndex]] || '';
				if (jongIndex > 0) {
					result += this.HANGUL_TO_QWERTY[this.JONGSUNG[jongIndex]] || '';
				}
			} else {
				result += this.HANGUL_TO_QWERTY[char] || '';
			}
		}
		return result;
	}
	
	attachRemainingListeners() { 
		document.querySelectorAll('[data-click]').forEach(el => { 
			if (el.classList.contains('octagon-center')) return; 
			let pointerDownHere = false; 
			let hasTriggeredDrag = false; 
			let lastTapAt = 0; 
			let startX = 0, startY = 0; 
			el.addEventListener('pointerdown', e => { 
				if (this.state.tapState.centerPressed) return; 
				pointerDownHere = true; 
				hasTriggeredDrag = false; 
				startX = e.clientX; 
				startY = e.clientY; 
				this.state.dragState.isActive = true; 
				try { el.setPointerCapture(e.pointerId); } catch (err) {} 
				e.preventDefault(); 
			}); 
			el.addEventListener('pointermove', e => { 
				if (!pointerDownHere || hasTriggeredDrag) return; 
				const rect = el.getBoundingClientRect(); 
				if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) { 
					hasTriggeredDrag = true; 
					this.cancelPendingTap(); 
					if (el.dataset.drag) { this.handleInput(el.dataset.drag); } 
					pointerDownHere = false; 
					this.state.dragState.isActive = false; 
					try { el.releasePointerCapture(e.pointerId); } catch (err) {} 
				} 
			}); 
			el.addEventListener('pointerup', e => { 
				if (this.state.tapState.centerPressed) return; 
				if (!pointerDownHere) return; 
				const dx = e.clientX - startX; 
				const dy = e.clientY - startY; 
				const movedDist = Math.hypot(dx, dy); 
				if (movedDist <= OUTER_BUTTON_DEAD_ZONE) { 
					const now = Date.now(); 
					if (now - lastTapAt <= DOUBLE_TAP_MS) { 
						this.cancelPendingTap(); 
						this.handleInput(el.dataset.dblclick || el.dataset.click); 
						lastTapAt = 0; 
					} else { 
						lastTapAt = now; 
						const action = () => this.handleInput(el.dataset.click); 
						const timerId = setTimeout(() => { action(); 
						this.state.pendingSingleTap = null; }, DOUBLE_TAP_MS); 
						this.state.pendingSingleTap = { timerId, action }; 
					} 
				} 
				pointerDownHere = false; 
				this.state.dragState.isActive = false; 
				try { el.releasePointerCapture(e.pointerId); } catch (err) {} 
			}); 
		}); 
		this.display.addEventListener('click', () => this.flushPendingTap()); 
		document.getElementById('refresh-btn').addEventListener('click', () => { 
			this.clear(); 
			this.flushPendingTap(); 
		});
			
        const setupContinuousPress = (buttonId, action) => {
            const button = document.getElementById(buttonId);
            let pressTimer = null;
            let pressInterval = null;

            const stopPress = () => {
                clearTimeout(pressTimer);
                clearInterval(pressInterval);
            };

            button.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                this.flushPendingTap();
                action(); 
                this.resetComposition();
                
                pressTimer = setTimeout(() => {
                    pressInterval = setInterval(() => {
                        action();
                        this.resetComposition();
                    }, 100); 
                }, 400); 
            });

            button.addEventListener('pointerup', stopPress);
            button.addEventListener('pointerleave', stopPress);
        };		
		
        setupContinuousPress('cursor-left', () => {
            const pos = this.display.selectionStart;
            if (pos > 0) {
                this.display.selectionStart = this.display.selectionEnd = pos - 1;
            }
            this.display.focus();
        });
		
		setupContinuousPress('cursor-right', () => {
            const pos = this.display.selectionEnd;
            if (pos < this.display.value.length) {
                this.display.selectionStart = this.display.selectionEnd = pos + 1;
            }
            this.display.focus();
        });

        setupContinuousPress('backspace', () => {
            this.backspace();
        });

        setupContinuousPress('delete-btn', () => {
            this.deleteNextChar();
        });
				
		document.getElementById('copy-btn').addEventListener('click', () => this.copyToClipboard()); 
		document.getElementById('scale-up').addEventListener('click', () => this.setScale(this.state.scale + 0.01)); 
		document.getElementById('scale-down').addEventListener('click', () => this.setScale(this.state.scale - 0.01)); 
		document.getElementById('hand-left').addEventListener('click', () => this.moveKeyboard(-10)); 
		document.getElementById('hand-right').addEventListener('click', () => this.moveKeyboard(10)); 
		document.getElementById('position-up').addEventListener('click', () => this.moveKeyboardVertical(-10)); 
		document.getElementById('position-down').addEventListener('click', () => this.moveKeyboardVertical(10)); 
        
        // 5. 회전 버튼에 이벤트 리스너 추가
        document.getElementById('rotate-left').addEventListener('click', () => this.rotateKeyboard(-1));
        document.getElementById('rotate-right').addEventListener('click', () => this.rotateKeyboard(1));

		document.getElementById('settings-btn').addEventListener('click', () => this.openSettings()); 
		document.querySelector('.close-button').addEventListener('click', () => this.closeSettings()); 
		window.addEventListener('click', (event) => { 
			if (event.target == this.settingsModal) this.closeSettings(); 
		}); 
		this.layerButtons.forEach(btn => btn.addEventListener('click', () => this.switchLayer(btn.dataset.layer))); 
	}
	
	// 기능 함수들
    backspace() {
        const last = this.state.lastCharInfo;
        const start = this.display.selectionStart;
        const end = this.display.selectionEnd;

        // 한글 조합 중이고, 커서가 글자 맨 뒤에 있을 때만 분해 로직 실행
        if (last && start === end && start > 0 && start === this.display.value.length) {
            
            const getLastQwertyLength = () => {
                if (this.state.activeLayer !== 'KE' || !last) return 1;
                let lastHangul = '';
                if (last.type === 'C') lastHangul = last.cho;
                else if (last.type === 'V') lastHangul = last.jung;
                else if (last.type === 'CV') lastHangul = this.combineCode(last.cho, last.jung);
                else if (last.type === 'CVJ') lastHangul = this.combineCode(last.cho, last.jung, last.jong);
                return this.convertToQwerty(lastHangul).length || 1;
            };

            let removeLength = this.state.activeLayer === 'KE' ? getLastQwertyLength() : 1;
            let newChar = '';
            let newLastInfo = null;
            let performNormalBackspace = false;

            switch (last.type) {
                // 'CVJ': 받침이 있는 경우 (예: '값', '각')
                case 'CVJ':
                    const reversedDouble = this.REVERSE_DOUBLE_FINAL[last.jong];
                    if (reversedDouble) { // 겹받침 -> 홑받침 (예: '값' -> '갑')
                        const newJong = reversedDouble[0];
                        newChar = this.combineCode(last.cho, last.jung, newJong);
                        newLastInfo = { type: 'CVJ', cho: last.cho, jung: last.jung, jong: newJong };
                    } else { // 홑받침 -> 받침 없음 (예: '각' -> '가')
                        newChar = this.combineCode(last.cho, last.jung);
                        newLastInfo = { type: 'CV', cho: last.cho, jung: last.jung };
                    }
                    break;

                // 'CV': 받침 없이 초성+중성인 경우 (예: '과', '가')
                case 'CV':
                    const simplerVowel = this.REVERSE_COMPLEX_VOWEL[last.jung];
                    if (simplerVowel) { // 복합 모음 -> 단모음 (예: '과' -> '고')
                        newChar = this.combineCode(last.cho, simplerVowel);
                        newLastInfo = { type: 'CV', cho: last.cho, jung: simplerVowel };
                    } else { // 단모음 -> 초성만 (예: '가' -> 'ㄱ')
                        newChar = last.cho;
                        newLastInfo = { type: 'C', cho: last.cho };
                    }
                    break;

                // 'V' 모음만 있는 경우 (예: 'ㅘ', 'ㅏ')
                case 'V':
                    const simplerSoloVowel = this.REVERSE_COMPLEX_VOWEL[last.jung];
                    if (simplerSoloVowel) { // 복합 모음 -> 단모음 (예: 'ㅘ' -> 'ㅗ')
                        newChar = simplerSoloVowel;
                        newLastInfo = { type: 'V', jung: simplerSoloVowel };
                    } else { // 단모음 -> 아무것도 없음
                        performNormalBackspace = true;
                    }
                    break;
                
                //'C': 자음만 있는 경우 (예: 'ㄱ')
                case 'C':
                    performNormalBackspace = true;
                    break;
            }

            if (performNormalBackspace) {
                // 일반 백스페이스 실행 후 조합 상태 초기화
                this.display.value = this.display.value.substring(0, start - removeLength);
                this.display.selectionStart = this.display.selectionEnd = start - removeLength;
                this.resetComposition();
            } else {
                // 분해된 글자로 교체
                const finalText = this.state.activeLayer === 'KE' ? this.convertToQwerty(newChar) : newChar;
                this.replaceTextBeforeCursor(removeLength, finalText);
                this.state.lastCharInfo = newLastInfo;
            }
            this.display.focus();
            return; // 분해 로직을 실행했으면 여기서 함수 종료
        }

        // --- 한글 조합 상태가 아닐 때 실행되는 기존 로직 ---
        if (start === 0 && end === 0) return;
        let newCursorPos = start;
        if (start === end) {
            if (start > 0) {
                this.display.value = this.display.value.substring(0, start - 1) + this.display.value.substring(start);
                newCursorPos = start - 1;
            }
        } else {
            this.display.value = this.display.value.substring(0, start) + this.display.value.substring(end);
            newCursorPos = start;
        }
        this.display.selectionStart = this.display.selectionEnd = newCursorPos;
        this.resetComposition();
        this.display.focus();
    }
	
	copyToClipboard() { 
		if (!this.display.value) return; 
		navigator.clipboard?.writeText(this.display.value)
		.then(() => alert('클립보드에 복사되었습니다.'))
		.catch(() => { 
			const ta = document.createElement('textarea'); 
			ta.value = this.display.value; 
			document.body.appendChild(ta); 
			ta.select(); 
			const ok = document.execCommand('copy'); 
			document.body.removeChild(ta); 
			if (ok) alert('클립보드에 복사되었습니다.'); 
			else alert('복사 실패: 수동으로 복사해주세요.'); 
		}); 
	}
	
	deleteNextChar() { 
		const start = this.display.selectionStart; 
		const end = this.display.selectionEnd; 
		const text = this.display.value; 
		if (start === end && start < text.length) { 
			this.display.value = text.substring(0, start) + text.substring(start + 1); 
			this.display.selectionStart = this.display.selectionEnd = start; 
		} else if (start < end) { 
			this.display.value = text.substring(0, start) + text.substring(end); 
			this.display.selectionStart = this.display.selectionEnd = start; 
		} 
		this.resetComposition(); 
		this.display.focus(); 
	}
	
	insertAtCursor(text) { 
		const start = this.display.selectionStart; 
		const end = this.display.selectionEnd; 
		this.display.value = this.display.value.substring(0, start) + text + this.display.value.substring(end); 
		this.display.selectionStart = this.display.selectionEnd = start + text.length; 
		this.display.focus(); 
	}
	
	replaceTextBeforeCursor(charsToRemove, textToInsert) { 
		const start = this.display.selectionStart; 
		if (start < charsToRemove) return; 
		const before = this.display.value.substring(0, start - charsToRemove); 
		const after = this.display.value.substring(start); 
		this.display.value = before + textToInsert + after; 
		const newCursorPos = before.length + textToInsert.length; 
		this.display.selectionStart = this.display.selectionEnd = newCursorPos; 
		this.display.focus(); 
	}
	
	clear() { 
		this.display.value = ''; 
		this.resetComposition(); 
	}
	
	resetComposition() { 
		this.state.lastCharInfo = null; 
	}
	
	setScale(newScale) { 
		this.state.scale = Math.max(0.5, Math.min(newScale, 2.0)); 
		localStorage.setItem('keyboardScale', this.state.scale); 
		this.applyKeyboardTransform(); 
	}
	
	applyHorizontalPosition() { 
		this.keyboardContainer.style.left = `calc(50% + ${this.state.horizontalOffset}px)`; 
	}
	
    moveKeyboard(direction) { 
		this.state.horizontalOffset += direction; 
		this.applyHorizontalPosition(); 
		localStorage.setItem('keyboardHorizontalOffset', this.state.horizontalOffset); 
	}
	
    applyKeyboardTransform() { 
		const scale = `scale(${this.state.scale})`; 
		const translateX = `translateX(-50%)`; 
		const translateY = `translateY(${this.state.verticalOffset}px)`; 
        const rotate = `rotate(${this.state.rotation}deg)`; // 3. CSS transform에 rotate 추가
		this.keyboardContainer.style.transform = `${translateY} ${translateX} ${scale} ${rotate}`; // rotate 적용
	}
	
    moveKeyboardVertical(direction) { 
		this.state.verticalOffset += direction; 
		this.applyKeyboardTransform(); 
		localStorage.setItem('keyboardVerticalOffset', this.state.verticalOffset); 
	}

    // 4. 키보드를 회전시키는 함수 새로 추가
    rotateKeyboard(degrees) {
        this.state.rotation += degrees;
        this.applyKeyboardTransform();
        localStorage.setItem('keyboardRotation', this.state.rotation);
    }
	
    updateEnKeyCaps() { 
		const isCaps = this.state.capsLock; 
		const enKeys = document.querySelectorAll('.layer[data-layer="EN"] text'); 
		enKeys.forEach(key => { 
			const char = key.textContent; 
			if (char && char.length === 1 && char.match(/[a-z]/i)) { 
				key.textContent = isCaps ? char.toUpperCase() : char.toLowerCase(); 
			} 
		}); 
	}
	
    switchLayer(layerName) {
		this.flushPendingTap();

		// --- ▼▼▼ 핵심 수정 부분 ▼▼▼ ---

		// 1. 'K' 버튼을 눌렀을 때
		if (layerName === 'KR') {
			this.state.capsLock = false; // K 모드로 전환 시, Caps Lock 모드는 항상 끄도록 추가
			if (this.state.activeLayer === 'KR') {
				this.state.isQwertyOutput = !this.state.isQwertyOutput;
			} 
			else {
				this.state.activeLayer = 'KR';
				this.state.isQwertyOutput = false;
			}
		} 
		// 2. 'E' 버튼을 눌렀을 때
		else if (layerName === 'EN') {
			this.state.isQwertyOutput = false; // E 모드로 전환 시, KE 모드는 항상 끄도록 추가
			if (this.state.activeLayer === 'EN') {
				this.state.capsLock = !this.state.capsLock;
			} 
			else {
				this.state.activeLayer = 'EN';
				this.state.capsLock = false;
			}
		} 
		// 3. 그 외 다른 레이어 버튼을 눌렀을 때
		else {
			this.state.activeLayer = layerName;
			this.state.isQwertyOutput = false;
			this.state.capsLock = false;
		}

		// --- ▲▲▲ 수정 완료 ▲▲▲ ---

		// --- UI 업데이트 부분 (기존과 동일하지만 중요해서 포함) ---
		this.resetComposition();

		document.querySelectorAll('.layer').forEach(div => {
			div.classList.toggle('active', div.dataset.layer === this.state.activeLayer);
		});

		this.layerButtons.forEach(btn => {
			btn.classList.remove('active', 'caps-on', 'qwerty-on');
        
			if (btn.dataset.layer === this.state.activeLayer) {
				btn.classList.add('active');
			}
		});
    
		const enButton = document.querySelector('button[data-layer="EN"]');
		if (enButton && this.state.capsLock) {
			enButton.classList.add('caps-on');
		}

		const krButton = document.querySelector('button[data-layer="KR"]');
		if (krButton && this.state.isQwertyOutput) {
			krButton.classList.add('qwerty-on');
			krButton.classList.remove('active'); 
		}

		this.updateEnKeyCaps();
		this.state.dragState = { isActive: false, conceptualVowel: null, lastOutput: null, isEnDrag: false, startX: 0, startY: 0, };
		this.state.tapState.centerPressed = false;
		clearTimeout(this._centerLongTimer);
	}
	
    openSettings() { 
		this.settingsModal.style.display = 'block'; 
	}
	
    closeSettings() { 
		this.settingsModal.style.display = 'none'; 
	}
}

document.addEventListener('DOMContentLoaded', () => {
    new HaromaKeyboard({
        displayId: 'display',
        displayContainerId: 'display-container',
        keyboardContainerId: 'keyboard-container',
        layerButtonSelector: 'button[data-layer]',
        settingsModalId: 'settings-modal'
    });
});