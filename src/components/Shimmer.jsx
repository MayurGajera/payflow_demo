export function ShimmerTable({ rows = 5, cols = 5 }) {
  return (
    <div className="table-wrapper shimmer-wrapper">
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}>
                <div className="shimmer-block w-20 h-4"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  <div className="shimmer-block w-full h-4"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ShimmerDetail() {
  return (
    <div className="shimmer-wrapper">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="detail-row"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div className="shimmer-block w-24 h-4"></div>
          <div className="shimmer-block w-40 h-4"></div>
        </div>
      ))}
    </div>
  );
}
