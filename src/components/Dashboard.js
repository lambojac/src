import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    ArcElement,
    PointElement,
    Tooltip,
    Legend,
    Title,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

// Register the required components
ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    ArcElement,
    PointElement,
    Tooltip,
    Legend,
    Title
);

const socket = io('http://localhost:4000');

const Dashboard = () => {
    const [activityData, setActivityData] = useState([]);
    const [loginData, setLoginData] = useState([]);
    const [pageVisitData, setPageVisitData] = useState([0, 0, 0]); // Initialize for page visit chart

    useEffect(() => {
        // Listen for user activity updates
        socket.on('userActivity', (data) => {
            setActivityData((prevData) => [...prevData, data]);

            // Update login/logout trends or page visits
            if (data.action.includes('login')) {
                setLoginData((prev) => [...prev, data.timestamp]);
            } else if (data.action.includes('visited')) {
                // Update the page visit data (Assuming `data.page` is either 'Home', 'Dashboard', or 'Profile')
                const pageIndex = ['Home', 'Dashboard', 'Profile'].indexOf(data.page);
                if (pageIndex > -1) {
                    setPageVisitData((prev) => {
                        const newData = [...prev];
                        newData[pageIndex] += 1;
                        return newData;
                    });
                }
            }
        });

        return () => {
            socket.off('userActivity');
        };
    }, []);

    // Define chart data and configurations
    const loginLogoutChartData = {
        labels: loginData.map((d) => new Date(d).toLocaleTimeString()),
        datasets: [
            {
                label: 'Login Trends',
                data: loginData.map((d, idx) => idx + 1),
                fill: false,
                backgroundColor: 'rgba(75,192,192,0.6)',
                borderColor: 'rgba(75,192,192,1)',
            },
        ],
    };

    const pageVisitChartData = {
        labels: ['Home', 'Dashboard', 'Profile'], // Example pages
        datasets: [
            {
                data: pageVisitData,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            },
        ],
    };

    return (
        <div>
            <h1>Admin Dashboard</h1>

            <div>
                <h2>Login/Logout Trends</h2>
                <Line data={loginLogoutChartData} />
            </div>

            <div>
                <h2>Page Visit Frequency</h2>
                <Pie data={pageVisitChartData} />
            </div>
        </div>
    );
};

export default Dashboard;
