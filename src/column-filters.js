import React, { useMemo } from 'react';
import styled from 'styled-components';

const NumberRangerContainer = styled.div`
    display: flex;
    span {
        margin: 0 7px;
    }
    input {
        width: 90px
    }
`;

const SliderContainer = styled.div`
    display: grid;
    grid-gap: 10px;
    grid-auto-flow: column;
`;

const useDateRange = ({ preFilteredRows, id }) => useMemo(() => {
    let max, min;
    max = min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    preFilteredRows.forEach(row => {
        min = Math.min(row.values[id], min);
        max = Math.max(row.values[id], max);
    })

    return [min, max];
}, [preFilteredRows, id]);

export function DefaultColumnFilter({
    column: { filterValue, preFilteredRows, setFilter }
}) {
    const count = preFilteredRows.length;
    return (
        <input
            className="form-control form-control-sm"
            type="text"
            value={filterValue || ''}
            onChange={e => {
                setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
            }}
            placeholder={`Search ${count} records...`}
        />
    )
}

export function SelectColumnFilter({
    column: { filterValue, setFilter, preFilteredRows, id }
}) {
    // Calculate the options for filtering using the preFilteredRows
    const options = useMemo(() => {
        const options = new Set();
        preFilteredRows.forEach(row => options.add(row.values[id]));
        return [...options.values()]
    }, [id, preFilteredRows]);

    // Render a multi-select box
    return (
        <select
            className="form-control custom-select-sm"
            value={filterValue}
            onChange={e => {
                setFilter(e.target.value || undefined)
            }}>
            <option value="">All</option>
            {options.map((option, i) => (
                <option value={option} key={i}>
                    {option}
                </option>
            ))}
        </select>
    )
}

export function SliderColumnFilter({
    column: { filterValue, setFilter, preFilteredRows, id }
}) {
    // Calculate the min and max using the preFilteredRows
    const [min, max] = useDateRange({
        preFilteredRows,
        id
    });

    return (
        <SliderContainer>
            <input 
                type="range" 
                className="form-control form-control-sm"
                min={min}
                max={max}
                value={filterValue || min}
                onChange={e => setFilter(parseInt(e.target.value, 10))}
            />
            {filterValue 
                ? (<button className="btn btn-primary btn-sm" onClick={() => setFilter(undefined)}>Off</button>)
                : null}
        </SliderContainer>
    )
}

export function NumberRangeColumnFilter({
    column: { filterValue = [], preFilteredRows, setFilter, id }
}) {
    const [min, max] = useDateRange({
        preFilteredRows,
        id
    });

    return (
        <NumberRangerContainer>
            <input
                className="form-control form-control-sm"
                value={filterValue[0] || ''}
                type="number"
                onChange={e => {
                    const val = e.target.value;
                    setFilter((old = []) => [
                        val ? parseInt(val, 10) : undefined,
                        old[1]
                    ]);
                }}
                placeholder={`Min (${min})`}
            />
            <span>to</span>
            <input
                className="form-control form-control-sm"
                value={filterValue[1] || ''}
                type="number"
                onChange={e => {
                    const val = e.target.value;
                    setFilter((old = []) => [
                        old[0],
                        val ? parseInt(val, 10) : undefined
                    ]);
                }}
                placeholder={`Max (${max})`}
            />
        </NumberRangerContainer>
    )
}