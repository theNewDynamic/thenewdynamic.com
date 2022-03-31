export default () => ({
  website: new URLSearchParams(window.location.search).get('website')
})