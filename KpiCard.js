const KpiCard = ({ title, value, change, changeType = 'increase' }) => {
    const changeColor = changeType === 'increase' ? 'text-green-500' : 'text-red-500';
    const arrow = changeType === 'increase' ? '↑' : '↓';
  
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="mt-2 text-3xl font-bold">{value}</p>
        {change && (
          <p className={`mt-1 text-sm ${changeColor}`}>
            <span className="font-semibold">{arrow} {change}</span>
            <span className="ml-1 text-gray-500">vs. mês anterior</span>
          </p>
        )}
      </div>
    );
  };
  
  export default KpiCard;
  