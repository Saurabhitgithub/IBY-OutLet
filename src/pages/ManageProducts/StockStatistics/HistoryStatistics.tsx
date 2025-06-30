
import { useSearchParams } from "react-router";
import ComponentCard from "../../../components/common/ComponentCard"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table"
import { getProductsDataByDateAndLocation } from "../../../services/apis";
import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";

;
export const HistoryStatistics = () => {

    const [searchParams] = useSearchParams();
    const [productData, setProductData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const date = searchParams.get("date") || "";
    const locationId = searchParams.get("location_id");


console.log(date);
    useEffect(() => {
        if (!date || !locationId) return;
        setLoading(true);
        getProductsDataByDateAndLocation(date, Number(locationId))
            .then((res) => {

                setProductData(res.data?.data || []);
            })
            .catch((err) => {
                setProductData([]);
                console.log(err);
            })
            .finally(() => setLoading(false));
    }, [date, locationId]);


    const backInfo =
    {
        title: `Stock Statistics - ${date}`, path: `/stockStatistics/view?date=${date}`
    }



    return (
        <>
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <PageBreadcrumb
                pageTitle={`Stock List - (${date})`}
                backInfo={backInfo}
            />
            <ComponentCard title="Stock List">
                <Table className="" >
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] ">
                        <TableRow>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start col-span-1">
                                Model
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start col-span-1">
                                Size
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start col-span-1">
                                Pressure
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start col-span-1">
                                Qty in Stock
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start col-span-1">
                                Unit Price(3)
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start col-span-1">
                                Costs In Stock By 3
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start col-span-1">
                                Owner
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {productData.length > 0 ? (
                            productData.map((item, index) => (
                                <TableRow key={index} >
                                    <TableCell className="px-5 py-3 text-gray-600 text-start">
                                        {item.model}
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-gray-600 text-start">
                                        {item.sizeData?.[0].name}
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-gray-600 text-start">
                                        {item.pressure_id}
                                    </TableCell>

                                    <TableCell className="px-5 py-3 text-gray-600 text-start max-w-2xl">
                                        {item.quantity}
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-gray-600 text-start max-w-2xl">
                                        {item.list_price?.$numberDecimal}
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-gray-600 text-start max-w-2xl">
                                        {item.price_3b?.$numberDecimal}
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-gray-600 text-start max-w-2xl">
                                        {item.product_owner}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell className="text-center py-4 text-gray-500">
                                    No data found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>

                </Table>
            </ComponentCard>
        </>
    )
}
