export const redirectURL = () => {
  let REDIRECT_URI = window.location.href
  .slice(0, -window.location.hash.length || window.location.href.length)
  .slice(0, -window.location.search.length || window.location.href.length);
  return REDIRECT_URI;
}