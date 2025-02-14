
type Column<T> = {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => JSX.Element | string;
};

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  actions?: (row: T) => JSX.Element;
};

const GenericTable = <T,>({ columns, data, actions }: TableProps<T>) => {
  return (
    <div className="w-full p-4 bg-black min-h-screen">
      <div className="max-w-[90rem] mx-auto">
        <div className="relative overflow-hidden rounded-xl bg-gray-900 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  {columns.map((col) => (
                    <th key={col.key.toString()} className="py-3 px-4 text-sm font-medium text-gray-300">
                      {col.label}
                    </th>
                  ))}
                  {actions && <th className="py-3 px-4 text-sm font-medium text-gray-300">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data.length > 0 ? (
                console.log("sdfa ",data),
                  data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="transition-colors hover:bg-gray-800/50">
                      {columns.map((col) => (
                        <td key={col.key.toString()} className="whitespace-nowrap py-3 px-4 text-sm text-gray-300">
                          {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                        </td>
                      ))}
                      {actions && (
                        <td className="whitespace-nowrap py-3 px-4">
                          {actions(row)}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length + (actions ? 1 : 0)} className="py-4 text-center text-gray-400">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end p-4 border-t border-gray-800">
            <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              View more...
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericTable;
