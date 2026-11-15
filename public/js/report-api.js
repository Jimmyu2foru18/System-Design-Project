const BASE_URL = '/api/reports';

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

  const url = query.toString() ? `${BASE_URL}?${query}` : BASE_URL;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Report API error ${response.status}`);
  const data = await response.json();
  const raw = Array.isArray(data) ? data : data.reports || [];
  const reports = Array.isArray(raw) ? raw : [];
  return reports.map(normalizeReport).filter(Boolean);
}

async function getReportById(reportId) {
  const response = await fetch(`${BASE_URL}/reports/${encodeURIComponent(reportId)}`);
  if (!response.ok) throw new Error(`Report API error ${response.status}`);
  const data = await response.json();
  return normalizeReport(data);
}

window.reportApi = { getReports, getReportById };
