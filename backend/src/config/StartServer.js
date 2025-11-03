function startServerAPI(app) {
    if (!app) {
        console.error('Express app instance is not provided!')
        process.exit(1)
    }

    const PORT = process.env.PORT || 3000

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`)
        console.log(`Swagger documentation available at http://localhost:${PORT}/api/docs`)
    })

    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason)
        process.exit(1)
    })

    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err.message)
        process.exit(1)
    })
}

module.exports = { startServerAPI }

