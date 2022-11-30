const fs = require(`fs`)
const express = require(`express`)
const app = express()
const PORT = process.env.PORT || 3333
const MYPATH = {
  VIEWS: `${__dirname}/views`,
  ITEMS: `${__dirname}/items.json`,
  DB: `${__dirname}/database.txt`,
}

// # 基本設定

app.set(`view engine`, `ejs`) // * テンプレートエンジンにejs指定
app.use(express.urlencoded({ extended: true })) // * POSTリクエスト解析

let items = require(MYPATH.ITEMS) // * json読み込み

// # ルーティング

// ## 😀 トップ
app.get(`/`, (req, res) => onTop(req, res))
app.post(`/`, (req, res) => {
  onTop(req, res, req.body)
})

const onTop = (req, res, params = {}) => {
  // res.send(`😀😀`)
  items = require(MYPATH.ITEMS) // * json読み込み
  const database = fs.readFileSync(MYPATH.DB, `utf-8`) // * txt読み込み
  res.render(`index`, { items, database, params }) // * ejsのレンダリング
}

// ## 😀 replace
app.post(`/replace`, (req, res) => {
  if (!req.body.selectedItem) return
  items.shift()
  items.unshift({ icon: req.body.selectedItem })
  fs.writeFile(MYPATH.ITEMS, JSON.stringify(items), () =>
    res.redirect(307, `/`)
  )
})
// ## 😀 push
app.post(`/push`, (req, res) => {
  if (!req.body.selectedItem) return
  items.push({ icon: req.body.selectedItem })
  fs.writeFile(MYPATH.ITEMS, JSON.stringify(items), () =>
    res.redirect(307, `/`)
  )
})
// ## 😀 unshift
app.post(`/unshift`, (req, res) => {
  if (!req.body.selectedItem) return
  items.unshift({ icon: req.body.selectedItem })
  fs.writeFile(MYPATH.ITEMS, JSON.stringify(items), () =>
    res.redirect(307, `/`)
  )
})
// ## 😀 delete
app.post(`/delete`, (req, res) => {
  const n = parseInt(req.body.delete)
  if (isNaN(n)) return
  items.splice(n, 1)
  console.log({ items })
  fs.writeFile(MYPATH.ITEMS, JSON.stringify(items), () => {
    res.redirect(307, `/`)
  })
})

// ## 😀 overwrite
app.post(`/overwrite`, (req, res) => {
  if (!req.body.overwrite) return
  fs.writeFile(MYPATH.DB, req.body.overwrite, () => {
    res.redirect(307, `/`)
  })
})

app.listen(PORT, () => {})
