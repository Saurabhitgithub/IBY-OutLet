import React, { useEffect, useState } from "react";
import { getAllOrderhistoryById, getAllUsers } from "../../../services/apis";
import { useParams } from "react-router";

export const SalesOrderHistoryByProducts: React.FC = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [salesData, setSalesData] = useState([]);
    useEffect(() => {
        if (id) {
            fetchSalesOrderHistoryBySalesId(id);
        }
    }, [id]);

    const fetchSalesOrderHistoryBySalesId = async (salesId: string) => {
        setLoading(true);
        try {
            const response = await getAllOrderhistoryById(salesId);
            if (response.data?.data) {
                const salesData = response.data.data;
                setSalesData(salesData);
                console.log("Sales Data:", salesData);
            }
        } catch (error) {
            console.error("Failed to fetch sales commission data:", error);
        }
        setLoading(false);
    };

    return (
        <div className="p-4">
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            <h1 className="text-2xl font-bold mb-2 text-center">Sales Order History by Products</h1>

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th colSpan={8} className="border p-2 text-left font-normal">
                                Company Name: N/A
                            </th>
                        </tr>
                        <tr className="bg-gray-100">
                            <th className="border p-2 text-left">No.</th>
                            <th className="border p-2 text-left">Date</th>
                            <th className="border p-2 text-left">Model</th>
                            <th className="border p-2 text-left">PN</th>
                            <th className="border p-2 text-left">Size</th>
                            <th className="border p-2 text-left">Stock</th>
                            <th className="border p-2 text-left">Location</th>
                            <th className="border p-2 text-left">Ordered</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salesData.map((item, index) => (
                            <tr key={item.no || index} className="hover:bg-gray-50">
                                <td className="border p-2">{index + 1}</td>
                                <td className="border p-2">{item.order_created_at}</td>
                                <td className="border p-2">{item.model}</td>
                                <td className="border p-2">{item.part_no}</td>
                                <td className="border p-2">{item.size}</td>
                                <td className="border p-2">{item.stock_qty}</td>
                                <td className="border p-2">{item.location}</td>
                                <td className="border p-2">{item.order_qty}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};