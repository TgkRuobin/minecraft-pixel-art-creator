export function autoDownload(url) {
  const a = document.createElement('a')
  a.href = url
  a.style.display = 'none'
  document.querySelector('body').appendChild(a)
  a.click()
  a.remove()
}