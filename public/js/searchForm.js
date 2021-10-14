$('.search-records').click(() => {
  $('.search-form').toggle("'slide', { direction: 'left' }, 1000");
  $('.search-form').css({"display": "flex"});
  $('#searchIcon').attr('src', (i, src) => {
    return src === 'assets/icons/search.svg' ? 'assets/icons/right.svg' : 'assets/icons/search.svg';
  })
})