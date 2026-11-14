const BASE_URL = 'https://thereportoftheweekapi.com/api/v1';

function normalizeReport(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id,
    title: raw.product || raw.title || 'Untitled Report',
    category: raw.category || raw.manufacturer || 'Other',
    date: raw.dateReleased || raw.date || null,
    summary: raw.videoTitle || raw.summary || '',
    rating: typeof raw.rating === 'number' ? raw.rating : 0,
    manufacturer: raw.manufacturer || '',
    videoCode: raw.videoCode || ''
  };
}

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
  const data = await response.json();
  const reports = Array.isArray(data.reports) ? data.reports : [];
  return reports.map(normalizeReport).filter(Boolean);
}

async function getReportById(reportId) {
  const response = await fetch(`${BASE_URL}/reports/${encodeURIComponent(reportId)}`);
  if (!response.ok) throw new Error(`Report API error ${response.status}`);
  const data = await response.json();
  return normalizeReport(data);
}

window.reportApi = { getReports, getReportById };
