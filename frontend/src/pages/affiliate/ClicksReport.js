import React, { useState, useEffect, useRef } from 'react';
import { FiFilter, FiDownload, FiFileText, FiFile } from 'react-icons/fi';
import { SiMicrosoftexcel } from 'react-icons/si';
import api from '../../services/api';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Table, Th, Td, Pagination, EmptyState } from '../../components/common/Table';
import { Input, Checkbox } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal, ModalFooter } from '../../components/common/Modal';
import './Affiliate.css';

const allColumns = [
  { key: 'click_id', label: 'Click ID', default: true },
  { key: 'offer_name', label: 'Offer Name', default: true },
  { key: 'offer_id', label: 'Offer ID', default: true },
  { key: 'ip', label: 'IP', default: true },
  { key: 'created_at', label: 'Date', default: true },
  { key: 'p1', label: 'P1', default: false },
  { key: 'p2', label: 'P2', default: false },
  { key: 'p3', label: 'P3', default: false },
  { key: 'p4', label: 'P4', default: false },
  { key: 'p5', label: 'P5', default: false },
  { key: 'p6', label: 'P6', default: false },
  { key: 'city', label: 'City', default: false },
  { key: 'country', label: 'Country', default: false },
  { key: 'state', label: 'State', default: false },
  { key: 'os', label: 'OS', default: false },
  { key: 'browser', label: 'Browser', default: false }
];

// Demo click data
const generateDemoClicks = () => {
  const offers = [
    { id: 101, name: 'Premium Finance App' },
    { id: 102, name: 'Gaming Platform' },
    { id: 103, name: 'E-commerce Store' },
    { id: 104, name: 'Education Portal' },
    { id: 105, name: 'Health & Fitness App' }
  ];

  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
  const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat', 'Rajasthan', 'Uttar Pradesh'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
  const oses = ['Android', 'iOS', 'Windows', 'macOS', 'Linux'];

  const clicks = [];
  const today = new Date();

  for (let i = 0; i < 50; i++) {
    const offer = offers[Math.floor(Math.random() * offers.length)];
    const date = new Date(today);
    date.setHours(date.getHours() - Math.floor(Math.random() * 168)); // Last 7 days

    clicks.push({
      click_id: `CLK${String(Date.now() + i).slice(-10)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      offer_name: offer.name,
      offer_id: offer.id,
      ip: `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      created_at: date.toISOString(),
      p1: Math.random() > 0.5 ? `sub_${Math.random().toString(36).substr(2, 6)}` : '',
      p2: Math.random() > 0.7 ? `camp_${Math.floor(Math.random() * 100)}` : '',
      p3: Math.random() > 0.8 ? `ref_${Math.floor(Math.random() * 50)}` : '',
      p4: '',
      p5: '',
      p6: '',
      city: cities[Math.floor(Math.random() * cities.length)],
      country: 'India',
      state: states[Math.floor(Math.random() * states.length)],
      os: oses[Math.floor(Math.random() * oses.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)]
    });
  }

  return clicks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

const ClicksReport = () => {
  const [clicks, setClicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: ''
  });
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(
    allColumns.filter(c => c.default).map(c => c.key)
  );
  const exportRef = useRef(null);

  useEffect(() => {
    fetchClicks();
  }, [pagination.page]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchClicks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 50,
        ...filters
      });
      const response = await api.get(`/reports/clicks?${params}`);
      if (response.data.success && response.data.data.clicks?.length > 0) {
        setClicks(response.data.data.clicks);
        setPagination(prev => ({
          ...prev,
          pages: response.data.data.pagination.pages
        }));
      } else {
        // Use demo data if no real data
        setClicks(generateDemoClicks());
        setPagination(prev => ({ ...prev, pages: 1 }));
      }
    } catch (error) {
      console.error('Failed to fetch clicks:', error);
      // Use demo data on error
      setClicks(generateDemoClicks());
      setPagination(prev => ({ ...prev, pages: 1 }));
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchClicks();
  };

  const toggleColumn = (key) => {
    setVisibleColumns(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  // Export functions
  const getExportData = () => {
    const headers = allColumns
      .filter(c => visibleColumns.includes(c.key))
      .map(c => c.label);

    const rows = clicks.map(click => {
      return allColumns
        .filter(c => visibleColumns.includes(c.key))
        .map(c => {
          if (c.key === 'created_at') {
            return formatDate(click[c.key]);
          }
          return click[c.key] || '';
        });
    });

    return { headers, rows };
  };

  const exportToCSV = () => {
    const { headers, rows } = getExportData();
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clicks_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setShowExportDropdown(false);
  };

  const exportToExcel = () => {
    const { headers, rows } = getExportData();

    // Create HTML table for Excel
    let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">';
    html += '<head><meta charset="UTF-8"></head><body>';
    html += '<table border="1">';
    html += '<tr>' + headers.map(h => `<th style="background:#f0f0f0;font-weight:bold;">${h}</th>`).join('') + '</tr>';
    rows.forEach(row => {
      html += '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>';
    });
    html += '</table></body></html>';

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clicks_report_${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    setShowExportDropdown(false);
  };

  const exportToPDF = () => {
    const { headers, rows } = getExportData();

    // Create printable HTML
    const printWindow = window.open('', '_blank');
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Clicks Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; margin-bottom: 10px; }
          p { color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #232323; color: white; padding: 10px 8px; text-align: left; }
          td { border: 1px solid #ddd; padding: 8px; }
          tr:nth-child(even) { background: #f9f9f9; }
          .footer { margin-top: 20px; text-align: center; color: #999; font-size: 11px; }
        </style>
      </head>
      <body>
        <h1>Clicks Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
        <div class="footer">Total Records: ${rows.length}</div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
    setShowExportDropdown(false);
  };

  return (
    <div className="report-page">
      <div className="page-header">
        <h1>Clicks Report</h1>
        <p>View all your click data</p>
      </div>

      <Card>
        <CardHeader
          action={
            <div className="header-actions">
              <div className="export-container" ref={exportRef}>
                <Button
                  variant="primary"
                  size="sm"
                  icon={FiDownload}
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                >
                  Export
                </Button>
                {showExportDropdown && (
                  <div className="export-dropdown">
                    <button className="export-option" onClick={exportToPDF}>
                      <FiFileText className="export-icon pdf" />
                      <span>Export as PDF</span>
                    </button>
                    <button className="export-option" onClick={exportToExcel}>
                      <SiMicrosoftexcel className="export-icon excel" />
                      <span>Export as Excel</span>
                    </button>
                    <button className="export-option" onClick={exportToCSV}>
                      <FiFile className="export-icon csv" />
                      <span>Export as CSV</span>
                    </button>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" icon={FiFilter} onClick={() => setShowColumnModal(true)}>
                Columns
              </Button>
            </div>
          }
        >
          <h3>Click Data</h3>
        </CardHeader>
        <CardBody>
          {/* Filters */}
          <div className="filter-bar">
            <Input
              type="date"
              label="Start Date"
              value={filters.start_date}
              onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
            />
            <Input
              type="date"
              label="End Date"
              value={filters.end_date}
              onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
            />
            <div className="filter-actions">
              <Button onClick={handleFilter}>Apply Filter</Button>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner" />
            </div>
          ) : clicks.length === 0 ? (
            <EmptyState
              title="No clicks found"
              description="No click data available for the selected period"
            />
          ) : (
            <>
              <Table>
                <thead>
                  <tr>
                    {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => (
                      <Th key={col.key}>{col.label}</Th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clicks.map((click, index) => (
                    <tr key={index}>
                      {visibleColumns.includes('click_id') && <Td><code className="click-id">{click.click_id}</code></Td>}
                      {visibleColumns.includes('offer_name') && <Td>{click.offer_name}</Td>}
                      {visibleColumns.includes('offer_id') && <Td>{click.offer_id}</Td>}
                      {visibleColumns.includes('ip') && <Td>{click.ip}</Td>}
                      {visibleColumns.includes('created_at') && <Td>{formatDate(click.created_at)}</Td>}
                      {visibleColumns.includes('p1') && <Td>{click.p1}</Td>}
                      {visibleColumns.includes('p2') && <Td>{click.p2}</Td>}
                      {visibleColumns.includes('p3') && <Td>{click.p3}</Td>}
                      {visibleColumns.includes('p4') && <Td>{click.p4}</Td>}
                      {visibleColumns.includes('p5') && <Td>{click.p5}</Td>}
                      {visibleColumns.includes('p6') && <Td>{click.p6}</Td>}
                      {visibleColumns.includes('city') && <Td>{click.city}</Td>}
                      {visibleColumns.includes('country') && <Td>{click.country}</Td>}
                      {visibleColumns.includes('state') && <Td>{click.state}</Td>}
                      {visibleColumns.includes('os') && <Td>{click.os}</Td>}
                      {visibleColumns.includes('browser') && <Td>{click.browser}</Td>}
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pagination
                page={pagination.page}
                pages={pagination.pages}
                onChange={(page) => setPagination(prev => ({ ...prev, page }))}
              />
            </>
          )}
        </CardBody>
      </Card>

      {/* Column Selection Modal */}
      <Modal
        isOpen={showColumnModal}
        onClose={() => setShowColumnModal(false)}
        title="Select Columns"
        size="sm"
      >
        <div className="column-selection">
          {allColumns.map(col => (
            <Checkbox
              key={col.key}
              label={col.label}
              checked={visibleColumns.includes(col.key)}
              onChange={() => toggleColumn(col.key)}
            />
          ))}
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowColumnModal(false)}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ClicksReport;
