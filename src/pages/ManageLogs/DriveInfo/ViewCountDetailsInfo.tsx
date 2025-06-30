
import ComponentCard from "../../../components/common/ComponentCard";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { useParams } from "react-router";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import * as React from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

// Months and Years
const months: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const years: number[] = [2025, 2024, 2023, 2022, 2021, 2020, 2019];

// Sample static data
const staticData: { [year: number]: { [month: number]: string } } = {
  2025: { 1: "100", 2: "110", 3: "120", 4: "130", 5: "140", 6: "150", 7: "160", 8: "170", 9: "180", 10: "190", 11: "200", 12: "210" },
  2024: { 1: "90", 2: "95", 3: "100", 4: "105", 5: "110", 6: "115", 7: "120", 8: "125", 9: "130", 10: "135", 11: "140", 12: "145" },
  2023: { 1: "80", 2: "85", 3: "90", 4: "95", 5: "100", 6: "105", 7: "110", 8: "115", 9: "120", 10: "125", 11: "130", 12: "135" },
  2022: { 1: "70", 2: "75", 3: "80", 4: "85", 5: "90", 6: "95", 7: "100", 8: "105", 9: "110", 10: "115", 11: "120", 12: "125" },
  2021: { 1: "60", 2: "65", 3: "70", 4: "75", 5: "80", 6: "85", 7: "90", 8: "95", 9: "100", 10: "105", 11: "110", 12: "115" },
  2020: { 1: "50", 2: "55", 3: "60", 4: "65", 5: "70", 6: "75", 7: "80", 8: "85", 9: "90", 10: "95", 11: "100", 12: "105" },
  2019: { 1: "40", 2: "45", 3: "50", 4: "55", 5: "60", 6: "65", 7: "70", 8: "75", 9: "80", 10: "85", 11: "90", 12: "95" },
};

export const ViewCountDetailsInfo: React.FC = () => {
  let { id } = useParams();

  const backInfo = { title: "Count Info", path: "/drive/counterInfo" };
  return (
    <div className="p-4">
      <div>
        <PageBreadcrumb
          pageTitle={id ? "Details" : "Drive Info"}
          backInfo={backInfo}
        />
        </div>
        {/* <h1 className="text-xl font-bold mb-4">Drive Info</h1> */}

        <ComponentCard title="Count Drive Info">
          <div style={{ overflow: "auto" }}>
            <Table>
              <TableHeader className=" border-b border-gray-100 dark:border-white/[0.05]" >
                <TableRow>
                  <TableCell isHeader className=" px-5 py-3 font-medium text-gray-500 text-start" >Year/Month</TableCell>
                  {months.map(month => (
                    <TableCell isHeader key={month} className=" px-5 py-3 font-medium text-gray-500 text-start">{month}</TableCell>
                  ))}

                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {years.map(year => (
                  <TableRow key={year}>
                    <TableCell className=" px-4 py-3  text-gray-600 text-start">{year}</TableCell>
                    {months.map(month => (
                      <TableCell key={month} className=" px-4 py-3  text-gray-600 text-start">{staticData[year][month]}</TableCell>

                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>

        <span className="flex justify-end mt-1">
          <Stack spacing={2}>
            <Pagination count={10} color="primary" />

          </Stack>
        </span>

















      </div>
      );
};
