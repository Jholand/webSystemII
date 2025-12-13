import { useState } from 'react';
import { FileText, Download, TrendingUp, Calendar, Users } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const PriestReports = () => {
  const [selectedReport, setSelectedReport] = useState(null);

  const reports = [
    {
      id: 1,
      title: 'Monthly Sacrament Summary',
      description: 'Overview of all sacraments performed this month',
      type: 'Sacraments',
      period: 'November 2025',
      icon: FileText,
      data: {
        baptisms: 12,
        weddings: 5,
        confirmations: 8,
        funerals: 3,
        total: 28
      }
    },
    {
      id: 2,
      title: 'Attendance Trends Report',
      description: 'Mass attendance statistics and trends',
      type: 'Attendance',
      period: 'Last 3 Months',
      icon: TrendingUp,
      data: {
        avgSunday: 245,
        avgWeekday: 87,
        specialEvents: 156,
        trend: '+12%'
      }
    },
    {
      id: 3,
      title: 'Annual Sacrament Report',
      description: 'Yearly summary of all sacraments administered',
      type: 'Sacraments',
      period: '2025',
      icon: Calendar,
      data: {
        baptisms: 124,
        weddings: 45,
        confirmations: 89,
        funerals: 34,
        total: 292
      }
    },
    {
      id: 4,
      title: 'Parish Members Report',
      description: 'Active parishioners and family statistics',
      type: 'Members',
      period: 'Current',
      icon: Users,
      data: {
        totalMembers: 1234,
        activeFamilies: 356,
        newThisMonth: 8,
        inactiveRate: '5%'
      }
    }
  ];

  const handleViewReport = (report) => {
    setSelectedReport(report);
  };

  const handleExport = (report) => {
    showInfoToast('Exporting', `Exporting report: ${report.title} to PDF`);
  };

  const getReportColor = (type) => {
    const colors = {
      Sacraments: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Attendance: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Members: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in-down">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 dark:from-gray-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
            Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
            View and export pre-built reports and statistics
          </p>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => {
            const IconComponent = report.icon;
            return (
              <Card key={report.id} padding="lg" hoverable>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <IconComponent size={24} className="text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {report.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {report.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Type and Period */}
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getReportColor(report.type)}`}>
                      {report.type}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Period: {report.period}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleViewReport(report)}
                    >
                      <FileText size={18} className="mr-2" />
                      View Report
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() => handleExportPDF(report)}
                    >
                      <Download size={18} className="mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Report Preview */}
        {selectedReport && (
          <Card title={`${selectedReport.title} - Preview`} padding="lg">
            <div className="space-y-6">
              {/* Report Info */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getReportColor(selectedReport.type)}`}>
                    {selectedReport.type}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Period: {selectedReport.period}
                  </p>
                </div>
                <Button variant="primary" onClick={() => handleExportPDF(selectedReport)}>
                  <Download size={18} className="mr-2" />
                  Export to PDF
                </Button>
              </div>

              {/* Report Data */}
              {selectedReport.type === 'Sacraments' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Sacrament Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Baptisms</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {selectedReport.data.baptisms}
                      </p>
                    </div>
                    <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Weddings</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {selectedReport.data.weddings}
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Confirmations</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {selectedReport.data.confirmations}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Funerals</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {selectedReport.data.funerals}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {selectedReport.data.total}
                      </p>
                    </div>
                  </div>

                  {/* Chart Placeholder */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      📊 Sacrament distribution chart would appear here
                    </p>
                  </div>
                </div>
              )}

              {selectedReport.type === 'Attendance' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Attendance Analysis
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Sunday Mass</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {selectedReport.data.avgSunday}
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Weekday Mass</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {selectedReport.data.avgWeekday}
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Special Events</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {selectedReport.data.specialEvents}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Growth Trend</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {selectedReport.data.trend}
                      </p>
                    </div>
                  </div>

                  {/* Chart Placeholder */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      📈 Attendance trend line chart would appear here
                    </p>
                  </div>
                </div>
              )}

              {selectedReport.type === 'Members' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Parish Members Overview
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {selectedReport.data.totalMembers}
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active Families</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {selectedReport.data.activeFamilies}
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">New This Month</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {selectedReport.data.newThisMonth}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Inactive Rate</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {selectedReport.data.inactiveRate}
                      </p>
                    </div>
                  </div>

                  {/* Chart Placeholder */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      👥 Member demographics chart would appear here
                    </p>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Summary</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  This report provides a comprehensive overview of {selectedReport.type.toLowerCase()} for the period of {selectedReport.period}. 
                  The data shown represents actual recorded entries in the church management system.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PriestReports;
