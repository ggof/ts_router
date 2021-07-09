import createRouter from './router'

const router = createRouter()

router.GET("/users/me", (req, res) => {
  res.writeHead(200).write("route /users/me")
})

router.GET("/", (req, res) => {
  res.writeHead(200).write("this is the index")
})

router.GET("/posts/my/mom/is/fast", (req, res) => (res.write("this is a long route!")))
router.POST("/posts/my/mom/is/fast", (req, res) => (res.write("this is a long route!")))

router.listen()

