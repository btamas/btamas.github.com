$(function(){
	$(".eventTitle, .eventPosition").click(function(){

		$(".eventLongDescription")
			.not(
				$(this).parent().find(".eventLongDescription")
			)
			.animate(
				{height: "0px"},
				200,
				function(){
					$(this).hide();
				}
			);

		var el = $(this).parent().find(".eventLongDescription:hidden"),
			autoHeight = el.css("height", "auto").height();

		el.height(0).show().animate(
			{ height: autoHeight },
			200,
			function(){
				$(this).css("height","auto");
			}
		);
	});
});