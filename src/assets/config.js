export const mapCenter = {
  lon: 17.6322,
  lat: 59.8996,
  zoom: 8,
}

export const focusZoomLevel = 14

export const apiUrl = "https://saints.dh.gu.se/api"

export function image(tbl) {
  switch (tbl) {
    case "iconographic":
      return {
        viewer: "openseadragon",
        field: "filename",
        toUrl: (filename) =>
          `https://data.dh.gu.se/iconographic/${filename.replace(".tif", ".jpg")}`,
        toThumbUrl: (filename) =>
          `https://data.dh.gu.se/iconographic/thumbs/${filename.replace(".tif", ".jpg")}`,
      }

    case "shm_art":
      return {
        viewer: "openseadragon",
        field: "samsoek.images.filename",
        type: "pyramid",
        toUrl: (imageUrl) => {
          const fileName = imageUrl.split("/").pop().replace(".jpg", ".tif")
          return `https://img.dh.gu.se/art/pyr/${fileName}/info.json`
        },
        toThumbUrl: (imageUrl) => {
          const fileName = imageUrl.split("/").pop().replace(".jpg", ".tif")
          return `https://img.dh.gu.se/art/pyr/${fileName}/full/50,/0/default.jpg`
        },
      }

    default:
      return null
  }
}