const BASE_URL = 'https://thereportoftheweekapi.com/api/v1';

async function getReports(filters = {}) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  const url = query.toString() ? `${BASE_URL}/reports/?${query}` : `${BASE_URL}/reports/`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Report API error ${response.status}`);
  return response.json();
}

async function getReportById(reportId) {
  const response = await fetch(`${BASE_URL}/reports/${encodeURIComponent(reportId)}`);
  if (!response.ok) throw new Error(`Report API error ${response.status}`);
  return response.json();
}

window.reportApi = { getReports, getReportById };
