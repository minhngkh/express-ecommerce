const reportService = require("./service");

const RevenueRange = {
  _24h: 0,
  day: 1,
  month: 2,
  year: 3,
};

const MaxEntriesToDisplay = 5;

exports.displayCharts = async (req, res, next) => {
    const dayChart = await reportService.getTotalRevenues(RevenueRange.day);
    const monthChart = await reportService.getTotalRevenues(RevenueRange.month);
    const yearChart = await reportService.getTotalRevenues(RevenueRange.year);

    const _24hRevenue = await reportService.getProductRevenue(RevenueRange._24h, MaxEntriesToDisplay);
    const dayRevenue = await reportService.getProductRevenue(RevenueRange.day, MaxEntriesToDisplay);
    const monthRevenue = await reportService.getProductRevenue(RevenueRange.month, MaxEntriesToDisplay);
    const yearRevenue = await reportService.getProductRevenue(RevenueRange.year, MaxEntriesToDisplay);

    res.render("reports/charts", {
        dayChart: JSON.stringify(dayChart),
        monthChart: JSON.stringify(monthChart),
        yearChart: JSON.stringify(yearChart),
        _24hRevenue,
        dayRevenue,
        monthRevenue,
        yearRevenue,
        size: "800px",
        type: "line",
    });
}