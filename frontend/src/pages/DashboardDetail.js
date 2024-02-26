import {
  Button,
  Skeleton,
  Space,
  Table,
  Tag,
} from "antd";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ResponsivePieCanvas  } from '@nivo/pie'
import { selectUser } from "../redux/auth/selectors";
import DashboardService from "../service/DashboardService";
import { sdgDefault } from "../data/constants";

const DashboardDetail = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [sdgs, setSdgs] = useState(sdgDefault);
  const [pendingProgramData, setPendingProgramData] = useState([]);
  const [submittedProgramData, setSubmittedProgramData] = useState([]);
  const user = useSelector(selectUser);

  const load = useCallback(() => {
    DashboardService.getDashboardDetails().then((res) => {
      if (!res.data) return;
      setData(res.data);
      let _sdgtotal = Object.values(res.data.sdgs).reduce((acc, i) => {
        acc += i;
        return acc;
      });
      if(_sdgtotal == 0) _sdgtotal = 1;
      let _sdg = sdgDefault.map((item, index) => {
        item.value = (res.data.sdgs[item.id] * 100 / _sdgtotal).toFixed(2);
        return item;
      })
      setSdgs(_sdg);
      setPendingProgramData(res.data.pendingPrograms);
      setSubmittedProgramData(res.data.submissions);
      console.log("data", res.data);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const clickSGDNode = (node, event) => {
    console.log("click sgd node", node)
    console.log("click sgd index", node.data?.index)
    if(!node.data?.index) return;
    navigate(
      `/dashboard/sdgdetails?id=${node.data?.index}`
    );
  }

  const submissionColumns = [
    {
      title: "User Name",
      dataIndex: "userName",
      key: "userName",
      width: 180,
    },
    {
      title: "User Email",
      dataIndex: "userEmail",
      key: "userEmail",
      width: 180,
    },
    {
      title: "Assessment Name",
      dataIndex: "assessmentName",
      key: "assessmentName",
      width: 180,
    },
    {
      title: "Submission Type",
      dataIndex: "submissionType",
      key: "submissionType",
      width: 150,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (text) => (
        <Tag
          color={
            text === "Submitted"
              ? "green"
              : text === "Waiting"
              ? "orange"
              : text === "Approved"
              ? "green"
              : "red"
          }
        >
          {text === "Waiting" ? "Submitted" : text}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 160,
      render: (text) => (
        <time dateTime={text} className="">
          {moment(text).format("Do MMM, YYYY")}
        </time>
      ),
    },
    {
      title: "Actions",
      key: "action",
      width: 100,
      render: (record) => (
        <Space size={[12, 10]} wrap>
          <Button
            className="px-2 py-1 text-sm rounded"
            type="primary"
            onClick={() => {
              navigate(
                `/dashboard/programdetails?id=${record.data.programId._id}`
              );
            }}
          >
            View Submission
          </Button>
        </Space>
      ),
    },
  ];

  const pendingProgramsColumns = [
    {
      title: "Program Name",
      dataIndex: "programName",
      key: "programName",
      width: 160,
    },
    {
      title: "Category",
      dataIndex: "categoryName",
      key: "categoryName",
      width: 150,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 350,
      render: (text) => <div className="line-clamp-3">{text}</div>,
    },
    {
      title: "Incomplete Steps",
      dataIndex: "incompleteSteps",
      key: "incompleteSteps",
      width: 180,
      render: (incompleteSteps) => (
        <ul role="list" className="list-disc space-y-1 pl-2">
          {incompleteSteps &&
            incompleteSteps?.map((step) => (
              <li key={step}>
                <span className="px-1">{step}</span>
              </li>
            ))}
        </ul>
      ),
    },
    {
      title: "Actions",
      key: "action",
      width: 100,
      render: (record) => (
        <Button
          className="px-2 py-1 text-sm rounded"
          type="primary"
          onClick={() => {
            navigate(`/dashboard/suitedetails?id=${record.data._id}`);
          }}
        >
          View Program
        </Button>
      ),
    },
  ];

  if (!data) return <Skeleton active />;

  return (
    <div className="">
      <div className={"mx-auto md:p-4 2xl:p-6 2xl:px-6 bg-[#f1f5f9]"}>
        <div className={"mt-7.5 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5 "}>
          <div className={"col-span-12 shadow-sm bg-white p-8"}>
            <h2 className={"text-gray-900 text-2xl font-bold pb-4"}>
              Sustainable Development Goals
            </h2>
            <div className="flex flex-row justify-between items-center">
              <div className="h-[700px] w-[90%]">
                <ResponsivePieCanvas 
                  onClick={(node, event) => {clickSGDNode(node, event)}}
                  data={sdgs}
                  margin={{ top: 100, right: 200, bottom: 100, left: 100 }}
                  innerRadius={0.5}
                  padAngle={0.3}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  colors={sdgDefault.map(i => i.color)}
                  borderColor={{
                      from: 'color',
                      modifiers: [
                          [
                              'darker',
                              0.6
                          ]
                      ]
                  }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#333333"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabel={e=>e.value+"%"}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor="#ffffff"
                  defs={[
                      {
                          id: 'dots',
                          type: 'patternDots',
                          background: 'inherit',
                          color: 'rgba(255, 255, 255, 0.3)',
                          size: 4,
                          padding: 1,
                          stagger: true
                      },
                      {
                          id: 'lines',
                          type: 'patternLines',
                          background: 'inherit',
                          color: 'rgba(255, 255, 255, 0.3)',
                          rotation: -45,
                          lineWidth: 6,
                          spacing: 10
                      }
                  ]}
                  fill={[
                      {
                          match: {
                              id: 'python'
                          },
                          id: 'dots'
                      },
                      {
                          match: {
                              id: 'scala'
                          },
                          id: 'lines'
                      },
                  ]}
                  legends={[]}
                />
              </div>
              <ul role="list" className="list-disc space-y-1 pl-2">
                  {sdgDefault?.map((sdg, index) => (
                      <li key={index} className="flex items-center">
                          <img
                              className="h-8 w-auto rounded-md"
                              src={`/images/sdg-icons/E_WEB_${index + 1}.png`}
                              alt={sdg.Name}
                          />
                      </li>
                  ))}
              </ul>
            </div>
          </div>

          <div className={"col-span-12 shadow-sm bg-white p-8"}>
            <h2 className={"text-gray-900 text-2xl font-bold pb-4"}>
              Recent Submissions
            </h2>
            <div
              className={
                "col-span-12 rounded-sm border border-stroke bg-white  pt-7.5 shadow-default sm:px-7.5 xl:col-span-8"
              }
            >
              <div className="relative overflow-x-auto">
                <Table
                  dataSource={submittedProgramData.map((item, index) => ({
                    key: index,
                    userName:
                      item.user_id?.firstName + " " + item.user_id?.lastName,
                    userEmail: item.user_id?.email,
                    assessmentName: item.programId.name,
                    submissionType:
                      (item.formData.hasOwnProperty("submittedData") &&
                        "Online") ||
                      (item.formData.hasOwnProperty("fileData") &&
                        "Imported Data"),
                    status: (() => {
                      if (
                        item.formData.isFinishClicked &&
                        item.formData.hasOwnProperty("fileData")
                      ) {
                        return "Approved";
                      } else if (item.status === "reject") {
                        return "Rejected";
                      } else if (item.status === "approve") {
                        return "Approved";
                      } else {
                        return "Waiting";
                      }
                    })(),
                    data: item,
                  }))}
                  columns={submissionColumns}
                  pagination={false}
                  bordered={false}
                  scroll={{ x: "750px" }}
                  rowKey="_id"
                />
              </div>
            </div>
          </div>

          <div className={"col-span-12 shadow-sm bg-white p-8"}>
            <h2 className={"text-gray-900 text-2xl font-bold pb-4"}>
              Pending Programs
            </h2>
            <div
              className={
                "col-span-12 rounded-sm border border-stroke bg-white pt-7.5 shadow-default sm:px-7.5 xl:col-span-8"
              }
            >
              <div className="relative overflow-x-auto">
                <Table
                  dataSource={pendingProgramData.map((item, index) => {
                    const incompleteSteps = [];
                    if (!item.hasKPIs) incompleteSteps.push("No KPIs");
                    if (!item.hasAssessment)
                      incompleteSteps.push("No Assessment");
                    if (!item.hasPublishAssessment)
                      incompleteSteps.push("No Published Assessment");

                    return {
                      key: index,
                      programName: item.name,
                      categoryName: item.categoryDetails?.Name || "-",
                      description: item.description,
                      incompleteSteps:
                        incompleteSteps.length > 0 ? incompleteSteps : ["-"],
                      data: item,
                    };
                  })}
                  columns={pendingProgramsColumns}
                  pagination={false}
                  bordered={false}
                  scroll={{ x: "750px" }}
                  rowKey="_id"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDetail;
