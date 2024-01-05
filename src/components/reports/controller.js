const reportService = require("./service");

exports.displayCharts = async (req, res, next) => {
    const chartData = await reportService.getProductRevenue(2, 10);
    res.render("reports/charts", {
        data: JSON.stringify(chartData),
        name: "Statistics",
        size: "800px",
    });
}