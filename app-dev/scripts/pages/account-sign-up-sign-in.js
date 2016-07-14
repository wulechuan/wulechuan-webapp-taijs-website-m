(function () {
	var $bP = $('.popup-layers-back-plate');
	var $pL1 = $('#pl-info-too-many-vcodes-today');


	$('[button-action="fetch-sms-vcode"]').on('click', function(event) {
		console.error('fake logic triggered.');
		$bP.show();
		$pL1.show();
	});

	$pL1.find('[button-action="confirm]').on('click', function(event) {
		$bP.hide();
		$pL1.hide();
	});


	$('#credit-abstract-pane .operations button').on('click', function(event) {
		$bP.show();
		$pL2.show();
	});

	$pL2.find('[button-action="confirm]').on('click', function(event) {
		$bP.hide();
		$pL2.hide();
	});
})();