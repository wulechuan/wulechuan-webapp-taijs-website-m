(function () { // permanent logics
	var wlc = window.webLogicControls;
	var WCU = wlc.CoreUtilities;
	var UI = wlc.UI;

	function Application() {
		this.data = {
			URIParameters: wlc.generalTools.URI.evaluateParameters()
		};

		this.input = {
			validator: {
				fixedIncomeInvestmentAmount: function () {
					var fieldElement = this.elements.field;

					var value = parseFloat(fieldElement.value);
					var valueString = value+'';
					var errorInfoElement;

					// C.w('Getting criteria from HTML is NOT safe!');
					var min = parseFloat(fieldElement.getAttribute('data-value-min'));
					var max = parseFloat(fieldElement.getAttribute('data-value-max'));
					if (isNaN(value)) return false;

					var isInteger = !valueString.match(/\./);

					var isWhole100 = isInteger && !!valueString.match(/\d+00$/);

					if (!isNaN(min) && !isNaN(max)) {
						var low = Math.min(min, max);
						var high = Math.max(min, max);
						min = low;
						max = high;
					}

					var isValid = isWhole100;

					if (!isNaN(min)) {
						if (value < min) {
							isValid = false;
						} else {
						}
					}

					if (!isNaN(max)) {
						if (value > max) {
							errorInfoElement = $('.input-tip.error[data-subject="amount-too-high"]')[0];
							isValid = false;
						}
					}

					// C.t(value, min, max, isValid);

					return {
						isValid: isValid,
						errorInfoElement: errorInfoElement
					};
				}
			}
		};
	}

	var app = new Application();
	if (typeof window.taijs !== 'object') window.taijs = {};
	var taijs = window.taijs;
	taijs.app = app;
	// C.l(taijs.app);



	$('.page').each(function () {
		var page = this;
		commonSetupAciontsForOnePage(page);
		// setTimeout(function () {
		// 	commonSetupAciontsForOnePage(page); // twice to ensure everything get initialized
		// }, 600);
	});
	function commonSetupAciontsForOnePage(page) {
		if (!(page instanceof Node)) return false;

		var isFirstTime = true;
		if (!!page.status && page.status.commonSetupHasBeenRun === true) {
			isFirstTime = false;
			C.l('Setup page common behaviours a second time.');
		}

		if (typeof page.status !== 'object') page.status = {};

		var $page = $(page);

		setupPageBodyMinHeightForPage($page, isFirstTime);
		setupAllPopupLayers(page);
		setupAllAutoConstructTabPanelSets($page, isFirstTime);
		setupAllMenuItemsThatHasSubMenu($page, isFirstTime);
		setupAllNavBackButtons($page, isFirstTime);
		setupAllButtonsWithInlineClickAction($page, isFirstTime);
		setupAllStaticProgressRings($page, isFirstTime);
		setupAllContentsWithDesiredStringFormat($page, isFirstTime);
		setupAllChineseNumbersPresenters($page, isFirstTime);
		setupAllSensitiveContentBlocks($page, isFirstTime);

		$('form').each(function () { new wlc.UI.VirtualForm(this); });

		$('a').each(function () {
			var anchor = this;
			var $children = $(this).find('> *');
			$children.each(function () {
				this.style.transitionProperty = 'none';
			});

			$(this)
				.on('mousedown', function () {
					$children.each(function () {
						this.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
					});
				})
				.on('mouseup', function () {
					$children.each(function () {
						this.style.backgroundColor = '';
					});
				})
			;
		});

		page.status.commonSetupHasBeenRun = true; // always update this status

		function setupPageBodyMinHeightForPage($page, isFirstTime) {
			var pageBody = $page.find('.page-body')[0];
			if (!page || !pageBody) {
				return;
			}

			if (!isFirstTime) return true;

			var pageBodyOffsetY = $page.offset().top;
			var shouldSetBodyContent = false;
			var pageBodyContentOffsetY = 0;

			var windowInnerHeight = window.innerHeight;
			var pageBodyMinHeight = windowInnerHeight - pageBodyOffsetY;

			var pageHasFixedFooter = $page.hasClass('fixed-page-footer') && !!$page.find('.page-footer')[0];
			if (pageHasFixedFooter) {
				var pageFixedFooterHeight = 66;
				pageBodyMinHeight -= pageFixedFooterHeight;
			}

			var $pageBodyContent = $(pageBody).find('> .content-with-solid-bg');
			var pageBodyContent = $pageBodyContent[0];
			if (pageBodyContent) {
				shouldSetBodyContent = true;
				pageBodyContentOffsetY = $pageBodyContent.offset().top;
			}

			var pageBodyContentMinHeight = pageBodyMinHeight - pageBodyContentOffsetY + pageBodyOffsetY;
			// C.l(
			// 	'fixed-page-footer?', pageHasFixedFooter,
			//  	'\t pageBodyMinHeight', pageBodyMinHeight,
			//  	'\t pageBodyContentMinHeight', pageBodyContentMinHeight
			//  );

			if (shouldSetBodyContent) {
				$(pageBody).addClass('use-content-as-main-container');
				pageBodyContent.style.minHeight = pageBodyContentMinHeight + 'px';
			} else {
				$(pageBody).removeClass('use-content-as-main-container');
				pageBody.style.minHeight = pageBodyMinHeight + 'px';
			}
		}

		function setupAllPopupLayers(page/*, isFirstTime*/) {
			UI.popupLayersManager.processAllUnder(page);
		}

		function setupAllAutoConstructTabPanelSets($page, isFirstTime) {
			if (!isFirstTime) return true;

			$page.find('.tab-panel-set').each(function () {
				if (this.dataset.doNotAutoConstruct) {
					// C.l('Skipping auto constructing TabPanelSet from:', this);
					return true;
				}
				new wlc.UI.TabPanelSet(this, {
					initTab: app.data.URIParameters.tabLabel
				});
			});
		}

		function setupAllMenuItemsThatHasSubMenu($page, isFirstTime) {
			if (!isFirstTime) return true;

			$page.find('.menu-item.has-sub-menu').each(function () {
				var menuItem = this;
				var $menuItem = $(this);
				var $subMenu = $menuItem.find('> .menu-wrap, > .menu');
				if ($subMenu.length !== 1) {
					return false;
				}

				$menuItem.on('click', function () {
					showHideSubMenuUnderMenuItem(menuItem, 'toggle');
				});

				function showHideSubMenuUnderMenuItem(menuItem, action) {
					var subMenuWasExpanded = $(menuItem).hasClass('coupled-shown');
					var shouldTakeAction =
						(!subMenuWasExpanded && action==='expand') ||
						(subMenuWasExpanded && action==='collapse') ||
						(action==='toggle')
					;
					if (!shouldTakeAction) {
						return 0;
					}

					if (subMenuWasExpanded) {
						$(menuItem).removeClass('coupled-shown');
					} else {
						$(menuItem).addClass('coupled-shown');
					}
				}
			});
		}

		function setupAllNavBackButtons($page, isFirstTime) {
			if (!isFirstTime) return true;

			$page.find('.nav-back[data-back-target="history"]').on('click', function (event) {
				event.preventDefault();
				event.stopPropagation();
				history.back();
			});
		}

		function setupAllButtonsWithInlineClickAction($page, isFirstTime) {
			if (!isFirstTime) return true;

			$page.find('[data-click-action]').each(function () {
				var button = this;
				var inlineActionString = this.getAttribute('data-click-action');
				var hasValidAction = !!inlineActionString;

				var actionName;
				var actionTarget;
				if (hasValidAction) {
					var prefix = inlineActionString.match(/^\s*([^\:\s]+)\s*\:(.*)/);
					if (prefix) {
						actionName   = prefix[1];
						actionTarget = prefix[2];
					}
				}

				hasValidAction = false;
				var action;
				switch (actionName) {
					default:
						break;
					case 'show-popup':
						hasValidAction = !!actionTarget;
						action = hasValidAction && function (event) {
							UI.popupLayersManager.show(actionTarget, event);
						};
						break;
				}

				hasValidAction = hasValidAction && typeof action === 'function';

				if (!hasValidAction) {
					C.w('Inline action is invalid:', this);
					return false;
				}

				$(button).on('click', action);
			});
			// data-click-action="show-popup:pl-message-credit-limitation-introduction"
		}

		function setupAllStaticProgressRings($page) {
			if (!isFirstTime) return true;

			$page.find('.progress-rings').each(function () {
				if (this.getAttribute('data-dynamic')) return;
				new wlc.UI.ProgressRings(this);
			});
		}

		function setupAllContentsWithDesiredStringFormat($page, isFirstTime) {
			// if (!isFirstTime) return true;

			$page.find('[data-text-format]').each(function () {
				var tnlc = this.tagName.toLowerCase();
				if (tnlc === 'input' || tnlc === 'textarea' || tnlc==='select') {
					return;
				} else if (this.getAttribute('contentEditable') && this.getAttribute('contentEditable').toLowerCase() === 'true') {
					return;
				}

				this.textContent = WCU.stringFormatters.format(
					this.textContent,
					this.dataset.textFormat,
					false
				);
			});
		}

		function setupAllChineseNumbersPresenters($page, isFirstTime) {
			if (!isFirstTime) return true;

			$page.find('.chinese-number[for-element]').each(function () {
				var servedElementId = this.getAttribute('for-element');
				if (!servedElementId) return false;

				var servedElement = $(document).find('#'+servedElementId)[0];
				if (!servedElement) return false;


				var thisFormatElement = this;


				var tnlc = servedElement.tagName.toLowerCase();
				var contentIsFromUserInput = false;
				var contentIsFromSelect = false;
				var propertyToFormat = 'textContent';
				var elementIsValid = true;

				if (tnlc === 'input') {
					if (servedElement.type === 'checkbox' || servedElement.type === 'radio') {
						elementIsValid = false;
					} else {
						contentIsFromUserInput = true;
						propertyToFormat = 'value';
					}
				} else if (tnlc === 'textarea') {
					contentIsFromUserInput = true;
					propertyToFormat = 'value';
				} else if (tnlc === 'select') {
					contentIsFromUserInput = true;
					contentIsFromSelect = true;
					propertyToFormat = 'value';
				} else if (servedElement.getAttribute('contentEditable') && servedElement.getAttribute('contentEditable').toLowerCase() === 'true') {
					contentIsFromUserInput = true;
				}

				if (!elementIsValid) return;


				_updateChineseNumbers();


				if (contentIsFromUserInput) {
					if (typeof servedElement.elements !== 'object') servedElement.elements = {};
					servedElement.elements.coupledChineseNumbers = thisFormatElement;
					$(servedElement).on(contentIsFromSelect ? 'change' : 'input', function () {
						_updateChineseNumbers();
					});
				}


				function _updateChineseNumbers() {
					var decimal = servedElement[propertyToFormat];
					var formatter = WCU.stringFormatters.decimalToChineseMoney;

					thisFormatElement.innerHTML = formatter.format(decimal);
					if (!contentIsFromSelect) {
						servedElement[propertyToFormat] = formatter.data.lastGroomedInput;
					}
				}
			});
		}

		function setupAllSensitiveContentBlocks($page, isFirstTime) {
			$page.find('.sensitive-content').each(function () {
				var $sensitiveContentBlock = $(this);

				var $toggleIcon = $sensitiveContentBlock.find('.sensitive-content-status-icon');
				if ($toggleIcon.length < 1) {
					C.e('No toggle icon found under a ".sensitive-content" block.');
					return false;
				}

				$sensitiveContentBlock.addClass('sensitive-content-shown');
				if (isFirstTime === true) {
					$toggleIcon.on('click', function () {
						$sensitiveContentBlock.toggleClass('sensitive-content-shown');
					});
				}
			});
		}
	}
})();

(function () { // fake logics
	$('a[href$="index.html"]').each(function () {
		this.href += '?login=true';
	});

	// var wlc = window.webLogicControls;
	// var UI = wlc.UI;

	// popupSomeWindowForTest();

	// function popupSomeWindowForTest() {
	// 	var pls = [
	// 		'pl-message-credit-limitation-introduction',
	// 		// 'plpm-modification-succeeded',
	// 		// 'pl-message-intro-jia-xi-quan',
	// 		'pl-message-intro-te-quan-ben-jin',
	// 		// 'pl-message-intro-ti-yan-jin',
	// 		// 'pl-available-tickets-list',
	// 		// 'pl-trading-password-incorrect',
	// 		// 'pl-product-terminated',
	// 		// 'pl-input-image-vcode'
	// 	];

	// 	var currentPL = 0;
	// 	$('.page-body').on('click', function () {
	// 		UI.popupLayersManager.show(pls[currentPL]);
	// 		currentPL++;
	// 		if (currentPL >= pls.length) currentPL -= pls.length;
	// 	});
	// }
})();
