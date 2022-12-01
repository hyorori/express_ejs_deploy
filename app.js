const fs = require(`fs`)
const express = require(`express`)
const mysql = require(`mysql`)
const { resolve } = require("path")

const app = express()
const PORT = process.env.PORT || 3333
const MYPATH = {
  VIEWS: `${__dirname}/views`,
  ITEMS: `${__dirname}/items.json`,
  TXT: `${__dirname}/database.txt`,
}

// # DB設定
const DB_CONFIG = {
  host: `localhost`,
  user: `root`,
  password: `wahuu4819`,
  database: `dev_express_ejs`,
}
const connection = mysql.createConnection(DB_CONFIG)

connection.connect((dbErr) => {
  if (dbErr) {
    console.log(`🍕`, dbErr.stack)
    return
  }
})
// # 基本設定

app.set(`view engine`, `ejs`) // * テンプレートエンジンにejs指定
app.use(express.urlencoded({ extended: true })) // * POSTリクエスト解析

let dbItems = []
let params = {}
let items = require(MYPATH.ITEMS) // * json読み込み
let txt = fs.readFileSync(MYPATH.TXT, `utf-8`) // * txt読み込み

// # ルーティング

// ## 😀 トップ
app.get(`/`, (req, res) => onTop(req, res))
app.post(`/`, (req, res) => {
  onTop(req, res, req.body)
})

const onTop = async (req, res, params = {}) => {
  // res.send(`😀😀`)
  items = require(MYPATH.ITEMS) // * json読み込み
  txt = fs.readFileSync(MYPATH.TXT, `utf-8`) // * txt読み込み

  const dbItems = await fetchDbItems() // * DBデータ取得

  console.log("[results]", dbItems)
  res.render(`index`, { items, txt, params, dbItems }) // * ejsのレンダリング
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
  fs.writeFile(MYPATH.TXT, req.body.overwrite, () => {
    res.redirect(307, `/`)
  })
})

// ## 😀 deleteDbItem
app.post(`/deleteDbItem`, (req, res) => {
  const id = parseInt(req.body.id)

  if (isNaN(id)) return

  console.log("req.body.id", id)

  // * DB内容: itemsテーブルから*(すべてのカラム)を取得

  connection.query(`delete from items where id = ${id}`, async (err) => {
    const dbItems = await fetchDbItems()
    console.log("deleteDbItem results", dbItems)
    res.redirect(307, `/`)
  })
})

// ## 😀 addDbItem
app.post(`/addDbItem`, (req, res) => {
  if (!req.body.name) return
  console.log("req.body.name", req.body.name)

  // * DB内容: itemsテーブルから*(すべてのカラム)を取得

  connection.query(
    `insert into items values (null,'${req.body.name}')`,
    async (err) => {
      const dbItems = await fetchDbItems()
      console.log("addDbItem results", dbItems)
      res.redirect(307, `/`)
      // res.render(`index`, { items, txt, params, dbItems }) // * ejsのレンダリング
    }
  )
})

const fetchDbItems = () =>
  new Promise((resolve, reject) => {
    // * DB内容: itemsテーブルから*(すべてのカラム)を取得
    connection.query(`SELECT * FROM items`, (err, results) => {
      if (err) resolve(null)
      if (!Array.isArray(results)) resolve([])
      resolve(results)
    })
  })

app.listen(PORT, () => {})
