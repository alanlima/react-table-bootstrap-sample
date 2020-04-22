import React, { useState, useRef, useMemo } from 'react'
import {
  useTable,
  usePagination,
  useSortBy,
  useFilters,
  useGroupBy,
  useExpanded,
  useRowSelected
} from 'react-table'
import matchSorter from 'match-sorter'
import makeData from './makeData'
import {
  DefaultColumnFilter,
  SelectColumnFilter,
  SliderColumnFilter,
  NumberRangeColumnFilter
} from './components/column-filters';
import {
  RecordCountCell, LogPropsCell, AggregateSumCell
} from './components/custom-cells'

const fuzzyTextFilterFn = (rows, id, filterValue) => {
  return matchSorter(rows, filterValue, { keys: [row => row.values[id]] })
}

function Table({ columns, data, updateData, skipReset }) {
  const filterTypes = React.useMemo(
    () => ({
      // Add a new fuzzyTextFilterFn filter type.
      fuzzyText: fuzzyTextFilterFn,
      // Or, override the default text filter to use
      // "startWith"
      text: (rows, id, filterValue) => {
        return rows.filter(row => {
          const rowValue = row.values[id]
          return rowValue !== undefined
            ? String(rowValue)
              .toLowerCase()
              .startsWith(String(filterValue).toLowerCase())
            : true
        })
      },
    }),
    []
  )

  const defaultColumn = React.useMemo(
    () => ({
      Filter: DefaultColumnFilter
    }),
    []
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    footerGroups,
    prepareRow,

    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page
    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: {
      pageIndex,
      pageSize,
      sortBy,
      groupBy,
      expanded,
      filters,
      selectedRowIds
    }
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      filterTypes,
      updateData,
      // We also need to pass this as the page doens't change 
      // when we edit the data.
      autoResetPage: !skipReset,
      autoResetSelectedRows: !skipReset
    },
    useFilters,
    useGroupBy,
    useSortBy,
    usePagination
  );

  console.log('footerGroup', { footerGroups })

  return (
    <>
      <div>
        <table className="table table-striped table-borderless table-hover table-dark" {...getTableProps} >
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()}>
                    <div>
                      <span {...column.getSortByToggleProps()}>
                        {column.render('Header')}
                        {column.isSorted
                          ? column.isSortedDesc
                            ? ' 🔽'
                            : ' 🔼'
                          : ''}
                      </span>
                    </div>
                    <div>{column.canFilter ? column.render('Filter') : null}</div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            {footerGroups.map(group => (
              <tr {...group.getFooterGroupProps()}>
                {group.headers.map(column => (
                  <td {...column.getFooterProps(column.footerProps)}>
                    { column.render('Footer', column.footerCellProps) }
                  </td>
                ))}
              </tr>
            ))}
          </tfoot>
        </table>
        <div>
          <nav aria-label="page navigation">
            <ul className="pagination">
              <li className="page-item">
                <button
                  className="page-link"
                  onClick={() => previousPage()}
                  disabled={!canPreviousPage}>
                  Previous
              </button>
              </li>

              {pageOptions.map(pageNumber => (
                <li key={pageNumber} className={`page-item ${pageNumber === pageIndex && 'active'}`}>
                  <button
                    className="page-link"
                    page-number={pageNumber}
                    onClick={() => gotoPage(pageNumber)}>
                    {pageNumber + 1}
                  </button>
                </li>
              ))}

              <li className="page-item">
                <button
                  className="page-link"
                  onClick={() => nextPage()}
                  disabled={!canNextPage}>
                  Next
              </button>
              </li>
            </ul>
          </nav>
        </div>

      </div>
      <pre>
        <code>
          {JSON.stringify(
            {
              pageIndex,
              pageSize,
              pageCount,
              pageOptions,
              canNextPage,
              canPreviousPage,
              sortBy,
              groupBy,
              expanded: expanded,
              filters,
              selectedRowIds: selectedRowIds
            },
            null,
            2
          )}
        </code>
      </pre>
    </>
  )
}
function App() {
  const columns = React.useMemo(
    () => [
      {
        Header: 'First Name',
        accessor: 'firstName',
        filter: 'fuzzyText',
        Footer: RecordCountCell,
        footerProps: {
        
        },
        footerCellProps: {
          recordsCountLabel: "record(s) ⭐️"
        }
      },
      {
        Header: 'Last Name',
        accessor: 'lastName'
      },
      {
        Header: 'Age',
        accessor: 'age',
        Filter: SliderColumnFilter,
        filter: 'equals'
      },
      {
        Header: 'Visits',
        accessor: 'visits',
        Filter: NumberRangeColumnFilter,
        filter: 'between',
        Footer: AggregateSumCell
      },
      {
        Header: 'Status',
        accessor: 'status',
        Filter: SelectColumnFilter,
        filter: 'includes'
      },
      {
        Header: 'Profile Progress',
        accessor: 'progress',
        Filter: SliderColumnFilter,
        filter: 'equals'
      }
    ],
    []
  );

  const [data, setData] = useState(() => makeData(50));
  const [originalData] = useState(data);

  // We need to keep the table from resetting the pageIndex when we
  // update Data. So we can keep track of that flag with a ref.
  const skipResetRef = useRef(false);

  // When our cell renderer calls updateMyData, we'll use
  // the rowIndex, columnId and new value to update the
  // original data
  const updateMyData = (rowIndex, columnId, value) => {
    // We also turn on the flag to not reset the page
    skipResetRef.current = true;
    setData(old =>
      old.map((row, index) => {
        if (index !== rowIndex) {
          return row;
        }
        return {
          ...row,
          [columnId]: value
        }
      }))
  }

  return (
    <div className="container">
      <Table
        columns={columns}
        data={data}
        updateData={updateMyData}
        skipReset={skipResetRef.current} />
    </div>
  )
}

export default App;