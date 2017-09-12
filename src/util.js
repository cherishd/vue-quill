/**
 * convert image file to dataURI -> dataURI
 * @param {File} image
 * @returns {Promise}
 */
export function image2DataURI (image) {
  if (typeof image === 'string') {
    return Promise.resolve(image)
  }
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.readAsDataURL(image)
    reader.onload = e => resolve(e.target.result)
    reader.onerror = err => reject(err)
  })
}
