// Toggle Back to Top button display when the user scrolls down 20px from the top of the document
window.onscroll = function () {
  if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
      $('#backToTop').css("display", "flex")
  } else {
      $('#backToTop').css("display", "none")
  }
};
$('#backToTop').click(() => {
  $('html, body').animate({
      scrollTop: $('html').offset().top
  }, 400);
});