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
		this.manualModal = document.getElementById(options.manualModalId);
		this.colorModal = document.getElementById(options.colorModalId); 
		
		// 색상 선택기 요소들
        this.vowelColorPicker = document.getElementById('vowel-color-picker');
        this.consonantColorPicker = document.getElementById('consonant-color-picker');
        this.functionColorPicker = document.getElementById('function-color-picker');
        this.resetColorsBtn = document.getElementById('reset-colors-btn');

        // 기본 색상 값 정의
        this.defaultColors = {
            vowel: '#5bd95b',
            consonant: '#c7fcc7',
            function: '#ededed'
        };
		
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
            oneTimeCapsLock: false, // <-- 새로운 상태 추가!
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
                lastEnLayerTapAt: 0, // <-- 새로운 상태 추가!
				longPressFired: false, 
				centerPressed: false, 
				centerDragHasExited: false 
			},
            pendingSingleTap: null
        };
        this.enLayerClickTimer = null; // 타이머 핸들러 추가
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
		this.loadColors();
		this.attachEventListeners();
        this.updateButtonStyles();
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
				lastHoveredKey = centerOctagon; 
                e.preventDefault();
				e.stopPropagation();
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

			if (this.state.activeLayer === 'KR') {
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
								charToInsert = ' ';
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

    updateButtonStyles() {
        this.layerButtons.forEach(btn => {
            // 모든 관련 클래스를 먼저 제거
            btn.classList.remove('active', 'caps-on', 'qwerty-on', 'one-time-caps-on');
    
            const layer = btn.dataset.layer;
    
            // 현재 활성화된 레이어에 'active' 클래스 추가
            if (layer === this.state.activeLayer) {
                btn.classList.add('active');
            }
    
            // EN 버튼에 대한 특별 스타일링
            if (layer === 'EN') {
                if (this.state.capsLock) {
                    btn.classList.add('caps-on');
                } else if (this.state.oneTimeCapsLock) {
                    btn.classList.add('one-time-caps-on');
                }
            }
    
            // KR 버튼에 대한 QWERTY 출력 모드 스타일링
            if (layer === 'KR' && this.state.isQwertyOutput) {
                btn.classList.add('qwerty-on');
                btn.classList.remove('active'); // QWERTY 모드는 'active' 상태보다 우선
            }
        });
    }

	updateSyllable(newVowel) {
		const getLastQwertyLength = () => {
			const last = this.state.lastCharInfo;
			if (!this.state.isQwertyOutput || !last) return 1; 
        
			let lastHangul = '';
			if (last.type === 'CV') {
				lastHangul = this.combineCode(last.cho, last.jung);
			} else {
				lastHangul = this.state.dragState.conceptualVowel || '';
			}
			return this.convertToQwerty(lastHangul).length || 1;
		};

		if (this.state.lastCharInfo && this.state.lastCharInfo.type === 'CV') {
			const cho = this.state.lastCharInfo.cho;
			const newChar = this.combineCode(cho, newVowel);
        
			const finalText = this.state.isQwertyOutput ? this.convertToQwerty(newChar) : newChar;
			const removeLength = getLastQwertyLength();
        
			this.replaceTextBeforeCursor(removeLength, finalText);
			this.state.lastCharInfo = { type: 'CV', cho: cho, jung: newVowel };

		} else {
			const finalText = this.state.isQwertyOutput ? this.convertToQwerty(newVowel) : newVowel;
			const removeLength = getLastQwertyLength();
        
			this.replaceTextBeforeCursor(removeLength, finalText);
			this.resetComposition();
		}
    
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
            const isLetter = /^[a-z]$/.test(char);
    
            if (this.state.activeLayer === 'EN' && isLetter) {
                if (this.state.capsLock) {
                    charToInsert = char.toUpperCase();
                } else if (this.state.oneTimeCapsLock) {
                    charToInsert = char.toUpperCase();
                    this.state.oneTimeCapsLock = false; // 사용 후 즉시 비활성화
                    this.updateButtonStyles(); // UI 업데이트
                    this.updateEnKeyCaps();    // 키보드 문자 업데이트
                }
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
			if (last && last.type === 'CV' && this.JONGSUNG.includes(char)) {
				const newChar = this.combineCode(last.cho, last.jung, char);
				const finalText = this.state.isQwertyOutput ? this.convertToQwerty(newChar) : newChar;
				const removeLength = this.state.isQwertyOutput ? getLastQwertyLength() : 1;
            
				this.replaceTextBeforeCursor(removeLength, finalText);
				this.state.lastCharInfo = { type: 'CVJ', cho: last.cho, jung: last.jung, jong: char };
    
			} else if (last && last.type === 'CVJ' && this.DOUBLE_FINAL[last.jong + char]) {
				const newJong = this.DOUBLE_FINAL[last.jong + char];
				const newChar = this.combineCode(last.cho, last.jung, newJong);
				const finalText = this.state.isQwertyOutput ? this.convertToQwerty(newChar) : newChar;
				const removeLength = this.state.isQwertyOutput ? getLastQwertyLength() : 1;

				this.replaceTextBeforeCursor(removeLength, finalText);
				this.state.lastCharInfo = { type: 'CVJ', cho: last.cho, jung: last.jung, jong: newJong };
    
			} else {
				this.resetComposition();
				const finalText = this.state.isQwertyOutput ? this.convertToQwerty(char) : char; 
				this.insertAtCursor(finalText);
				this.state.lastCharInfo = { type: 'C', cho: char };
				this.state.dragState.conceptualVowel = null;
			}
		} else if (isJungsung) {
			if (last && (last.type === 'V' || last.type === 'CV') && this.COMPLEX_VOWEL[last.jung + char]) {
				const newVowel = this.COMPLEX_VOWEL[last.jung + char];
				if (last.type === 'CV') {
					const newChar = this.combineCode(last.cho, newVowel);
					const finalText = this.state.isQwertyOutput ? this.convertToQwerty(newChar) : newChar;
					const removeLength = this.state.isQwertyOutput ? getLastQwertyLength() : 1;
					this.replaceTextBeforeCursor(removeLength, finalText);
					this.state.lastCharInfo = { type: 'CV', cho: last.cho, jung: newVowel };
				} else { 
					const finalText = this.state.isQwertyOutput ? this.convertToQwerty(newVowel) : newVowel;
					const removeLength = this.state.isQwertyOutput ? getLastQwertyLength() : 1;
					this.replaceTextBeforeCursor(removeLength, finalText);
					this.state.lastCharInfo = { type: 'V', jung: newVowel };
				}
			} else if (last && last.type === 'C') {
				const newChar = this.combineCode(last.cho, char);
				const finalText = this.state.isQwertyOutput ? this.convertToQwerty(newChar) : newChar;
				const removeLength = this.state.isQwertyOutput ? getLastQwertyLength() : 1;
				this.replaceTextBeforeCursor(removeLength, finalText);
				this.state.lastCharInfo = { type: 'CV', cho: last.cho, jung: char };

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
				const finalText = this.state.isQwertyOutput ? this.convertToQwerty(char1 + char2) : (char1 + char2);
				const removeLength = this.state.isQwertyOutput ? getLastQwertyLength() : 1;
				this.replaceTextBeforeCursor(removeLength, finalText);
			} else {
				this.resetComposition();
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
				e.stopPropagation();
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
		
		document.querySelectorAll('.refresh-btn').forEach(el => el.addEventListener('click', () => { 
			this.clear(); 
			this.flushPendingTap(); 
		}));
			
        const setupContinuousPress = (selector, action) => {
            document.querySelectorAll(selector).forEach(button => {
                if (!button) return;
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
            });
        };		
		
        setupContinuousPress('.cursor-left', () => {
            const pos = this.display.selectionStart;
            if (pos > 0) {
                this.display.selectionStart = this.display.selectionEnd = pos - 1;
            }
            this.display.focus();
        });
		
		setupContinuousPress('.cursor-right', () => {
            const pos = this.display.selectionEnd;
            if (pos < this.display.value.length) {
                this.display.selectionStart = this.display.selectionEnd = pos + 1;
            }
            this.display.focus();
        });

        setupContinuousPress('.backspace', () => {
            this.backspace();
        });

        setupContinuousPress('.delete-btn', () => {
            this.deleteNextChar();
        });
				
		document.querySelectorAll('.copy-btn').forEach(el => el.addEventListener('click', () => this.copyToClipboard()));
		document.querySelectorAll('.settings-btn').forEach(el => el.addEventListener('click', () => this.openSettings()));
		document.querySelectorAll('.manual-btn').forEach(el => el.addEventListener('click', () => this.openUserManual()));
		document.querySelectorAll('.color-btn').forEach(el => el.addEventListener('click', () => this.openColorModal()));
		document.getElementById('scale-up').addEventListener('click', () => this.setScale(this.state.scale + 0.01)); 
		document.getElementById('scale-down').addEventListener('click', () => this.setScale(this.state.scale - 0.01)); 
		document.getElementById('hand-left').addEventListener('click', () => this.moveKeyboard(-10)); 
		document.getElementById('hand-right').addEventListener('click', () => this.moveKeyboard(10)); 
		document.getElementById('position-up').addEventListener('click', () => this.moveKeyboardVertical(-10)); 
		document.getElementById('position-down').addEventListener('click', () => this.moveKeyboardVertical(10)); 
        document.getElementById('rotate-left').addEventListener('click', () => this.rotateKeyboard(-1));
        document.getElementById('rotate-right').addEventListener('click', () => this.rotateKeyboard(1));
		document.querySelectorAll('.close-button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeSettings();
                this.closeUserManual();
				this.closeColorModal();
            });
        });
		window.addEventListener('click', (event) => { 
			if (event.target == this.settingsModal) this.closeSettings(); 
			if (event.target == this.manualModal) this.closeUserManual();
			if (event.target == this.colorModal) this.closeColorModal();			
		});
		
		// 색상 선택기 이벤트 리스너 추가
        this.vowelColorPicker.addEventListener('input', () => this.applyColor('vowel', this.vowelColorPicker.value));
        this.consonantColorPicker.addEventListener('input', () => this.applyColor('consonant', this.consonantColorPicker.value));
        this.functionColorPicker.addEventListener('input', () => this.applyColor('function', this.functionColorPicker.value));

        this.vowelColorPicker.addEventListener('change', () => this.saveColors());
        this.consonantColorPicker.addEventListener('change', () => this.saveColors());
        this.functionColorPicker.addEventListener('change', () => this.saveColors());

        this.resetColorsBtn.addEventListener('click', () => this.resetColors());
		
		this.layerButtons.forEach(btn => {
            const layerName = btn.dataset.layer;
            if (layerName === 'EN') {
                // EN 버튼은 특별한 핸들러를 사용
                btn.addEventListener('pointerdown', () => this.handleEnLayerClick());
            } else {
                // 다른 버튼들은 기존 방식대로 작동
                btn.addEventListener('pointerdown', () => this.switchLayer(layerName));
            }
        });
	}
	
    backspace() {
        const last = this.state.lastCharInfo;
        const start = this.display.selectionStart;
        const end = this.display.selectionEnd;

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
                case 'CVJ':
                    const reversedDouble = this.REVERSE_DOUBLE_FINAL[last.jong];
                    if (reversedDouble) { 
                        const newJong = reversedDouble[0];
                        newChar = this.combineCode(last.cho, last.jung, newJong);
                        newLastInfo = { type: 'CVJ', cho: last.cho, jung: last.jung, jong: newJong };
                    } else {
                        newChar = this.combineCode(last.cho, last.jung);
                        newLastInfo = { type: 'CV', cho: last.cho, jung: last.jung };
                    }
                    break;
                case 'CV':
                    const simplerVowel = this.REVERSE_COMPLEX_VOWEL[last.jung];
                    if (simplerVowel) {
                        newChar = this.combineCode(last.cho, simplerVowel);
                        newLastInfo = { type: 'CV', cho: last.cho, jung: simplerVowel };
                    } else {
                        newChar = last.cho;
                        newLastInfo = { type: 'C', cho: last.cho };
                    }
                    break;
                case 'V':
                    const simplerSoloVowel = this.REVERSE_COMPLEX_VOWEL[last.jung];
                    if (simplerSoloVowel) {
                        newChar = simplerSoloVowel;
                        newLastInfo = { type: 'V', jung: simplerSoloVowel };
                    } else { 
                        performNormalBackspace = true;
                    }
                    break;
                case 'C':
                    performNormalBackspace = true;
                    break;
            }

            if (performNormalBackspace) {
                this.display.value = this.display.value.substring(0, start - removeLength);
                this.display.selectionStart = this.display.selectionEnd = start - removeLength;
                this.resetComposition();
            } else {
                const finalText = this.state.activeLayer === 'KE' ? this.convertToQwerty(newChar) : newChar;
                this.replaceTextBeforeCursor(removeLength, finalText);
                this.state.lastCharInfo = newLastInfo;
            }
            this.display.focus();
            return;
        }

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
        const rotate = `rotate(${this.state.rotation}deg)`;
		this.keyboardContainer.style.transform = `${translateY} ${translateX} ${scale} ${rotate}`;
	}
	
    moveKeyboardVertical(direction) { 
		this.state.verticalOffset += direction; 
		this.applyKeyboardTransform(); 
		localStorage.setItem('keyboardVerticalOffset', this.state.verticalOffset); 
	}

    rotateKeyboard(degrees) {
        this.state.rotation += degrees;
        this.applyKeyboardTransform();
        localStorage.setItem('keyboardRotation', this.state.rotation);
    }
	
    updateEnKeyCaps() { 
		const isCaps = this.state.capsLock || this.state.oneTimeCapsLock; 
		const enKeys = document.querySelectorAll('.layer[data-layer="EN"] text'); 
		enKeys.forEach(key => { 
			const char = key.textContent; 
			if (char && char.length === 1 && char.match(/[a-z]/i)) { 
				key.textContent = isCaps ? char.toUpperCase() : char.toLowerCase(); 
			} 
		}); 
	}

    handleEnLayerClick() {
        this.flushPendingTap();

        // 현재 EN 레이어가 아니면, EN 레이어로 전환
        if (this.state.activeLayer !== 'EN') {
            this.switchLayer('EN');
            return;
        }

        const now = Date.now();
        // 더블 클릭 감지
        if (now - this.state.tapState.lastEnLayerTapAt <= DOUBLE_TAP_MS) {
            clearTimeout(this.enLayerClickTimer); // 싱글 클릭 타이머 취소
            this.state.tapState.lastEnLayerTapAt = 0;

            this.state.capsLock = !this.state.capsLock; // Caps Lock 토글
            this.state.oneTimeCapsLock = false; // 한 번 대문자 모드는 해제
        } else {
            // 싱글 클릭 처리
            this.state.tapState.lastEnLayerTapAt = now;
            this.enLayerClickTimer = setTimeout(() => {
                if (this.state.capsLock) {
                    // Caps Lock이 켜져있을 때 한 번 클릭하면 모든 대문자 모드 해제
                    this.state.capsLock = false;
                    this.state.oneTimeCapsLock = false;
                } else {
                    // Caps Lock이 꺼져있을 때 한 번 클릭하면 '한 번 대문자' 모드 토글
                    this.state.oneTimeCapsLock = !this.state.oneTimeCapsLock;
                }
                this.updateButtonStyles();
                this.updateEnKeyCaps();
            }, DOUBLE_TAP_MS);
            return; // 싱글 클릭은 UI 업데이트를 타임아웃 뒤로 미룸
        }

        // 더블 클릭은 즉시 UI 업데이트
        this.updateButtonStyles();
        this.updateEnKeyCaps();
    }
	
    switchLayer(layerName) {
		clearTimeout(this.enLayerClickTimer);
		this.flushPendingTap();

		if (layerName === 'KR') {
			this.state.capsLock = false; 
            this.state.oneTimeCapsLock = false;
			if (this.state.activeLayer === 'KR') {
				this.state.isQwertyOutput = !this.state.isQwertyOutput;
			} 
			else {
				this.state.activeLayer = 'KR';
				this.state.isQwertyOutput = false;
			}
		} 
		else if (layerName === 'EN') { // EN 레이어로 전환될 때의 초기 상태 설정
			this.state.isQwertyOutput = false;
            if (this.state.activeLayer !== 'EN') {
                this.state.activeLayer = 'EN';
                this.state.capsLock = false;
                this.state.oneTimeCapsLock = false;
            }
		} 
		else {
			this.state.activeLayer = layerName;
			this.state.isQwertyOutput = false;
			this.state.capsLock = false;
            this.state.oneTimeCapsLock = false;
		}

		this.resetComposition();

		document.querySelectorAll('.layer').forEach(div => {
			div.classList.toggle('active', div.dataset.layer === this.state.activeLayer);
		});

        this.updateButtonStyles();
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
	
	openUserManual() {
        this.manualModal.style.display = 'block';
    }

    closeUserManual() {
        this.manualModal.style.display = 'none';
    }
	
	openColorModal() {
        this.colorModal.style.display = 'block';
    }

    closeColorModal() {
        this.colorModal.style.display = 'none';
    }

    applyColor(area, color) {
        document.documentElement.style.setProperty(`--${area}-area-color`, color);
    }

    saveColors() {
        localStorage.setItem('vowelColor', this.vowelColorPicker.value);
        localStorage.setItem('consonantColor', this.consonantColorPicker.value);
        localStorage.setItem('functionColor', this.functionColorPicker.value);
    }

    loadColors() {
        const savedVowelColor = localStorage.getItem('vowelColor') || this.defaultColors.vowel;
        const savedConsonantColor = localStorage.getItem('consonantColor') || this.defaultColors.consonant;
        const savedFunctionColor = localStorage.getItem('functionColor') || this.defaultColors.function;

        this.vowelColorPicker.value = savedVowelColor;
        this.consonantColorPicker.value = savedConsonantColor;
        this.functionColorPicker.value = savedFunctionColor;

        this.applyColor('vowel', savedVowelColor);
        this.applyColor('consonant', savedConsonantColor);
        this.applyColor('function', savedFunctionColor);
    }

    resetColors() {
        localStorage.removeItem('vowelColor');
        localStorage.removeItem('consonantColor');
        localStorage.removeItem('functionColor');
        this.loadColors(); // 기본값으로 다시 로드
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HaromaKeyboard({
        displayId: 'display',
        displayContainerId: 'display-container',
        keyboardContainerId: 'keyboard-container',
        layerButtonSelector: 'svg.keyboard-shell [data-layer]',
        settingsModalId: 'settings-modal',
		manualModalId: 'manual-modal',
		colorModalId: 'color-modal'
    });
});