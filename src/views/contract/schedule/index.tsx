import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DatePicker, Select, Button, message, Modal, Descriptions } from "antd";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import ContainerBase from "@/component/common/block/container/ContainerBase";
import BreadcrumbBase from "@/component/common/breadcrumb/Breadcrumb";
import { HomeOutlined, CalendarOutlined } from "@ant-design/icons";
import LoadingIndicator from "@/component/common/loading/LoadingCommon";
import { getContractSchedule, getContractCars } from "@/service/business/contractMng/contractMng.service";
import { ContractScheduleItemDTO, ContractCarDTO } from "@/service/business/contractMng/contractMng.type";
import { getAllActiveBranches, getBranchByCurrentUser } from "@/service/business/branchMng/branchMng.service";
import { getContractStatuses } from "@/service/business/contractMng/contractMng.service";
import { searchCars } from "@/service/business/carMng/carMng.service";
import { CarDTO } from "@/service/business/carMng/carMng.type";
import { getCarModels } from "@/service/business/carMng/carMng.service";
import {
  SearchOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ToolOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { formatDateDMY } from "@/utils/common";
import "./schedule.css";

const { RangePicker } = DatePicker;

const ContractSchedule: React.FC = () => {
  const pageTitle = "Xem lịch thuê xe";
  const breadcrumbItems = [
    { label: "Dashboard", path: "/", icon: <HomeOutlined /> },
    { label: "Xem lịch thuê xe", path: "/contract/schedule" },
  ];

  const navigate = useNavigate();

  // Default date range: từ đầu tháng đến cuối tháng hiện tại
  const getDefaultDateRange = (): [Dayjs, Dayjs] => {
    const startOfMonth = dayjs().startOf("month");
    const endOfMonth = dayjs().endOf("month");
    return [startOfMonth, endOfMonth];
  };

  // Filter states
  const [branchId, setBranchId] = useState<string>("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [modelNames, setModelNames] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>(getDefaultDateRange());

  // Options
  const [branchOptions, setBranchOptions] = useState<{ label: string; value: string }[]>([]);
  const [statusOptions, setStatusOptions] = useState<{ label: string; value: string }[]>([]);
  const [modelOptions, setModelOptions] = useState<{ label: string; value: string }[]>([]);

  // Data states
  const [scheduleData, setScheduleData] = useState<ContractScheduleItemDTO[]>([]);
  const [allCars, setAllCars] = useState<CarDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Modal state
  const [selectedContract, setSelectedContract] = useState<ContractScheduleItemDTO | null>(null);
  const [selectedContractCars, setSelectedContractCars] = useState<ContractCarDTO[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingContractCars, setLoadingContractCars] = useState(false);

  // Cell selection state for creating contract (multi-car range selection)
  const [selectionState, setSelectionState] = useState<{
    carIds: string[];           // Array of carIds (multiple cars)
    licensePlates: string[];    // Array of license plates
    models: string[];           // Array of car models
    startDay: Dayjs;
    endDay: Dayjs;
  } | null>(null);

  // Drag state for range selection
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{
    carId: string;
    licensePlate: string;
    model: string;
    day: Dayjs;
  } | null>(null);

  // Load options on mount
  useEffect(() => {
    // Load branches, models, statuses
    Promise.all([
      getAllActiveBranches(),
      getBranchByCurrentUser(),
      getContractStatuses(),
      getCarModels(),
    ]).then(([branchesRes, currentBranchRes, statusesRes, modelsRes]) => {
      // Set branch options - no "Tất cả chi nhánh"
      setBranchOptions(
        (branchesRes.data || []).map((b: any) => ({ label: b.name, value: b.id }))
      );

      // Set default branch to current user's branch
      const userBranchId = currentBranchRes.data?.id || "";
      setBranchId(userBranchId);

      // Set status options - exclude CANCELLED, add "Tất cả trạng thái"
      const allStatusNames = (statusesRes.data || [])
        .filter((s: any) => s.code !== "CANCELLED")
        .map((s: any) => s.code);
      
      setStatusOptions([
        { label: "Tất cả trạng thái", value: "" },
        ...(statusesRes.data || [])
          .filter((s: any) => s.code !== "CANCELLED")
          .map((s: any) => ({ label: s.name, value: s.code })),
      ]);

      // Set default statuses to all (excluding CANCELLED)
      setStatuses(allStatusNames);

      // Set model options
      const allModelNames = (modelsRes.data || []).map((m: string) => m);
      setModelOptions([
        { label: "Tất cả mẫu xe", value: "" },
        ...allModelNames.map((m: string) => ({ label: m, value: m })),
      ]);

      // Set default modelNames to all
      setModelNames(allModelNames);
    }).catch(() => {
      console.error("Failed to load options");
    });
  }, []);

  // Handle search button click
  const handleSearch = async () => {
    if (!dateRange[0] || !dateRange[1]) {
      message.warning("Vui lòng chọn khoảng thời gian!");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      // Load schedule data và danh sách xe song song
      // Note: Backend chỉ hỗ trợ 1 status, nên load tất cả rồi filter ở FE
      const [scheduleRes, carsRes] = await Promise.all([
        getContractSchedule({
          branchId: branchId || null,
          status: null, // Load tất cả status, filter ở FE
          startDate: dateRange[0].format("YYYY-MM-DD"),
          endDate: dateRange[1].format("YYYY-MM-DD"),
        }),
        searchCars({
          branchId: branchId || undefined,
          page: 1,
          size: 10000, // Lấy tất cả xe
        }),
      ]);

      // Filter cars by model if selected
      let filteredCars = carsRes.data.data || [];
      if (modelNames.length > 0) {
        filteredCars = filteredCars.filter((car) => modelNames.includes(car.model));
      }

      // Filter schedule data by model if selected
      let filteredScheduleData = scheduleRes.data || [];
      if (modelNames.length > 0) {
        // Get license plates of filtered cars
        const filteredLicensePlates = new Set(filteredCars.map((car) => car.licensePlate));
        const filteredCarIds = new Set(filteredCars.map((car) => car.id));
        
        filteredScheduleData = filteredScheduleData.filter((item) => {
          // Check if contract belongs to a filtered car
          return (
            filteredCarIds.has(item.carId) ||
            filteredLicensePlates.has(item.licensePlate)
          ) && modelNames.includes(item.carModel);
        });
      }
      // If modelNames is empty (all models selected), use all schedule data
      
      // Filter schedule data by statuses if selected (always exclude CANCELLED)
      if (statuses.length > 0) {
        filteredScheduleData = filteredScheduleData.filter((item) =>
          statuses.includes(item.status) && item.status !== "CANCELLED"
        );
      } else {
        // If no status selected, exclude CANCELLED
        filteredScheduleData = filteredScheduleData.filter((item) =>
          item.status !== "CANCELLED"
        );
      }

      setScheduleData(filteredScheduleData);
      setAllCars(filteredCars);
    } catch (err: any) {
      message.error("Lỗi khi tải dữ liệu!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate days in date range
  const daysInRange = useMemo(() => {
    if (!dateRange[0] || !dateRange[1]) return [];
    
    const days: Dayjs[] = [];
    let current = dateRange[0].startOf("day");
    const end = dateRange[1].endOf("day");

    while (current.isBefore(end) || current.isSame(end, "day")) {
      days.push(current);
      current = current.add(1, "day");
    }

    return days;
  }, [dateRange]);

  // Group data by model and license plate - include ALL cars (filtered by modelNames)
  const groupedData = useMemo(() => {
    const grouped: Record<string, Record<string, ContractScheduleItemDTO[]>> = {};

    // Filter cars by modelNames if selected
    const filteredCars = modelNames.length > 0
      ? allCars.filter((car) => modelNames.includes(car.model))
      : allCars;

    // First, add all filtered cars (even without contracts)
    filteredCars.forEach((car) => {
      if (!grouped[car.model]) {
        grouped[car.model] = {};
      }
      if (!grouped[car.model][car.licensePlate]) {
        grouped[car.model][car.licensePlate] = [];
      }
    });

    // Then, add schedule data (contracts)
    // If modelNames is empty (all models), show all contracts
    // If modelNames is selected, only show contracts for filtered cars
    const filteredCarIds = new Set(filteredCars.map((car) => car.id));
    const filteredLicensePlates = new Set(filteredCars.map((car) => car.licensePlate));
    
    scheduleData.forEach((item) => {
      // If no model filter, show all contracts
      // If model filter exists, only show contracts for filtered cars
      if (modelNames.length === 0) {
        // Show all contracts - add car to grouped if not exists
        if (!grouped[item.carModel]) {
          grouped[item.carModel] = {};
        }
        if (!grouped[item.carModel][item.licensePlate]) {
          grouped[item.carModel][item.licensePlate] = [];
        }
        grouped[item.carModel][item.licensePlate].push(item);
      } else {
        // Only add contracts for cars that are in the filtered list
        if (
          filteredCarIds.has(item.carId) ||
          filteredLicensePlates.has(item.licensePlate)
        ) {
          if (modelNames.includes(item.carModel)) {
            if (!grouped[item.carModel]) {
              grouped[item.carModel] = {};
            }
            if (!grouped[item.carModel][item.licensePlate]) {
              grouped[item.carModel][item.licensePlate] = [];
            }
            grouped[item.carModel][item.licensePlate].push(item);
          }
        }
      }
    });

    return grouped;
  }, [scheduleData, allCars, modelNames]);

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "CONFIRMED":
        return "#d9d9d9"; // Grey
      case "DELIVERED":
        return "#1890ff"; // Blue
      case "RETURNED":
        return "#faad14"; // Yellow
      case "COMPLETED":
        return "#52c41a"; // Green
      default:
        return "#d9d9d9";
    }
  };

  // Get car status icon
  const getCarStatusIcon = (status?: string) => {
    if (!status) return null;
    
    switch (status) {
      case "AVAILABLE":
        return <CheckCircleOutlined style={{ color: "#52c41a", marginLeft: 6 }} title="Hoạt động" />;
      case "NOT_AVAILABLE":
        return <WarningOutlined style={{ color: "#faad14", marginLeft: 6 }} title="Không sẵn sàng" />;
      case "MAINTENANCE":
        return <ToolOutlined style={{ color: "#1890ff", marginLeft: 6 }} title="Đang bảo dưỡng" />;
      case "BROKEN":
        return <CloseCircleOutlined style={{ color: "#ff4d4f", marginLeft: 6 }} title="Hỏng hóc" />;
      case "LOST":
        return <QuestionCircleOutlined style={{ color: "#cf1322", marginLeft: 6 }} title="Bị mất" />;
      default:
        return null;
    }
  };

  // Parse datetime string without timezone conversion
  // API returns datetime in Vietnam timezone (GMT+7), we need to parse it as-is
  const parseDateTimeAsLocal = (dateStr: string): Dayjs => {
    // Handle format: "2024-12-02T17:12:00" or "2024-12-02 17:12:00"
    // Parse as local time without timezone conversion
    const normalized = dateStr.replace("T", " ").split(".")[0]; // Remove milliseconds if any
    const [datePart, timePart] = normalized.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute, second] = (timePart || "00:00:00").split(":").map(Number);
    
    return dayjs()
      .year(year)
      .month(month - 1) // dayjs month is 0-indexed
      .date(day)
      .hour(hour)
      .minute(minute)
      .second(second || 0);
  };

  // Calculate bar position and width for a contract in a specific day
  const calculateBarPosition = (
    contractStartDate: string,
    contractEndDate: string,
    dayDate: Dayjs
  ): { left: string; width: string } | null => {
    const dayStart = dayDate.startOf("day");
    const dayEnd = dayDate.endOf("day");
    const contractStart = parseDateTimeAsLocal(contractStartDate);
    const contractEnd = parseDateTimeAsLocal(contractEndDate);

    // If contract doesn't overlap with this day
    if (contractEnd.isBefore(dayStart) || contractStart.isAfter(dayEnd)) {
      return null;
    }

    // Calculate start position in day
    const barStart = contractStart.isBefore(dayStart) ? dayStart : contractStart;
    const barEnd = contractEnd.isAfter(dayEnd) ? dayEnd : contractEnd;

    // Calculate percentage in day (24 hours)
    const startMinutes = barStart.diff(dayStart, "minute");
    const endMinutes = barEnd.diff(dayStart, "minute");
    const totalMinutesInDay = 24 * 60;

    return {
      left: `${(startMinutes / totalMinutesInDay) * 100}%`,
      width: `${((endMinutes - startMinutes) / totalMinutesInDay) * 100}%`,
    };
  };

  // Format time from datetime string
  const formatTime = (datetime: string): string => {
    return dayjs(datetime).format("HH:mm");
  };

  // Handle bar click - show modal
  const handleBarClick = async (contract: ContractScheduleItemDTO) => {
    setSelectedContract(contract);
    setModalVisible(true);
    setLoadingContractCars(true);
    
    try {
      // Load tất cả các xe trong hợp đồng
      const carsRes = await getContractCars(contract.contractId);
      setSelectedContractCars(carsRes.data || []);
    } catch (err: any) {
      console.error("Failed to load contract cars:", err);
      setSelectedContractCars([]);
    } finally {
      setLoadingContractCars(false);
    }
  };

  // Handle view contract detail
  const handleViewContract = () => {
    if (selectedContract) {
      setModalVisible(false);
      navigate(`/contract/detail/${selectedContract.contractId}`);
    }
  };

  // Check if cell is in selection range (supports multiple cars)
  const isCellSelected = (day: Dayjs, carId: string): boolean => {
    if (!selectionState) return false;
    const dayStr = day.format("YYYY-MM-DD");
    const startStr = selectionState.startDay.format("YYYY-MM-DD");
    const endStr = selectionState.endDay.format("YYYY-MM-DD");
    // Cell is selected if: in day range AND car is in selected cars list
    return dayStr >= startStr && dayStr <= endStr && selectionState.carIds.includes(carId);
  };

  // Check if day range matches current selection
  const isSameDayRange = (day: Dayjs): boolean => {
    if (!selectionState) return false;
    const dayStr = day.format("YYYY-MM-DD");
    const startStr = selectionState.startDay.format("YYYY-MM-DD");
    const endStr = selectionState.endDay.format("YYYY-MM-DD");
    return dayStr >= startStr && dayStr <= endStr;
  };

  // Mouse down - start or extend selection
  const handleCellMouseDown = (
    day: Dayjs,
    carId: string,
    licensePlate: string,
    model: string
  ) => {
    setIsDragging(true);
    setDragStart({ carId, licensePlate, model, day });

    if (selectionState && !isDragging) {
      // Check if clicking within same day range (to add/remove car)
      if (isSameDayRange(day)) {
        if (selectionState.carIds.includes(carId)) {
          // Remove this car from selection
          const idx = selectionState.carIds.indexOf(carId);
          const newCarIds = selectionState.carIds.filter((_, i) => i !== idx);
          const newLicensePlates = selectionState.licensePlates.filter((_, i) => i !== idx);
          const newModels = selectionState.models.filter((_, i) => i !== idx);

          if (newCarIds.length === 0) {
            setSelectionState(null);
          } else {
            setSelectionState({
              ...selectionState,
              carIds: newCarIds,
              licensePlates: newLicensePlates,
              models: newModels,
            });
          }
          return;
        } else {
          // Add this car to selection (same day range)
          setSelectionState({
            ...selectionState,
            carIds: [...selectionState.carIds, carId],
            licensePlates: [...selectionState.licensePlates, licensePlate],
            models: [...selectionState.models, model],
          });
          return;
        }
      }
    }

    // Different day range or no selection → start new selection
    setSelectionState({
      carIds: [carId],
      licensePlates: [licensePlate],
      models: [model],
      startDay: day,
      endDay: day,
    });
  };

  // Mouse enter - extend day range (only for first car when dragging)
  const handleCellMouseEnter = (
    day: Dayjs,
    carId: string,
    licensePlate: string,
    model: string
  ) => {
    if (isDragging && dragStart) {
      // When dragging, extend day range, keep only the first car
      const startDay = dragStart.day.isBefore(day) ? dragStart.day : day;
      const endDay = dragStart.day.isAfter(day) ? dragStart.day : day;

      setSelectionState({
        carIds: [dragStart.carId],
        licensePlates: [dragStart.licensePlate],
        models: [dragStart.model],
        startDay,
        endDay,
      });
    }
  };

  // Mouse up - end drag
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Global mouseup handler (in case mouse is released outside grid)
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setDragStart(null);
    };

    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  // Handle create contract with selected range (multiple cars)
  const handleCreateContractWithSelection = () => {
    if (selectionState && selectionState.carIds.length > 0) {
      // Format datetime for datetime-local input (YYYY-MM-DDTHH:mm)
      const startDate = selectionState.startDay.startOf("day").format("YYYY-MM-DDTHH:mm");
      const endDate = selectionState.endDay.endOf("day").format("YYYY-MM-DDTHH:mm");

      // Pass multiple carIds as comma-separated
      const carIds = selectionState.carIds.join(",");

      navigate(
        `/contract/create?carIds=${carIds}&startDate=${startDate}&endDate=${endDate}`
      );
    } else {
      navigate("/contract/create");
    }
  };

  // Handle model selection change
  const handleModelChange = (selectedValues: string[]) => {
    // Get all model names (excluding "Tất cả mẫu xe")
    const allModelNames = modelOptions
      .filter((opt) => opt.value !== "")
      .map((opt) => opt.value);

    // Check if "Tất cả mẫu xe" (empty value) is in the NEW selection
    const hasAllModelsInNew = selectedValues.includes("");
    // Check if "Tất cả mẫu xe" was in the PREVIOUS selection
    const hadAllModelsInPrevious = modelNames.length === allModelNames.length;
    
    // Filter out "Tất cả mẫu xe" from selected values
    const filteredValues = selectedValues.filter((v) => v !== "");
    
    if (hasAllModelsInNew) {
      // User clicked "Tất cả mẫu xe"
      if (hadAllModelsInPrevious) {
        // If all were already selected, deselect all
        setModelNames([]);
      } else {
        // If not all were selected, select all models
        setModelNames(allModelNames);
      }
    } else {
      // User clicked on individual model (not "Tất cả mẫu xe")
      // Just use the filtered values (excluding "Tất cả mẫu xe")
      setModelNames(filteredValues);
    }
  };

  // Handle status selection change
  const handleStatusChange = (selectedValues: string[]) => {
    // Get all status codes (excluding "Tất cả trạng thái" and CANCELLED)
    const allStatusCodes = statusOptions
      .filter((opt) => opt.value !== "")
      .map((opt) => opt.value);

    // Check if "Tất cả trạng thái" (empty value) is in the NEW selection
    const hasAllStatusesInNew = selectedValues.includes("");
    // Check if "Tất cả trạng thái" was in the PREVIOUS selection
    const hadAllStatusesInPrevious = statuses.length === allStatusCodes.length;
    
    // Filter out "Tất cả trạng thái" from selected values
    const filteredValues = selectedValues.filter((v) => v !== "");
    
    if (hasAllStatusesInNew) {
      // User clicked "Tất cả trạng thái"
      if (hadAllStatusesInPrevious) {
        // If all were already selected, deselect all
        setStatuses([]);
      } else {
        // If not all were selected, select all statuses
        setStatuses(allStatusCodes);
      }
    } else {
      // User clicked on individual status (not "Tất cả trạng thái")
      // Just use the filtered values (excluding "Tất cả trạng thái")
      setStatuses(filteredValues);
    }
  };

  return (
    <ContainerBase>
      <BreadcrumbBase title={pageTitle} items={breadcrumbItems} />
      <div className="schedule-container">
        <div className="schedule-header">
          <h2>{pageTitle}</h2>
        </div>

        {/* Filter Section */}
        <div className="schedule-filters">
          <div className="filter-row">
            <div className="filter-item">
              <label>Chi nhánh thuê xe:</label>
              <Select
                style={{ width: 200 }}
                value={branchId}
                onChange={setBranchId}
                options={branchOptions}
                placeholder="Chọn chi nhánh"
              />
            </div>

            <div className="filter-item">
              <label>Mẫu xe:</label>
              <Select
                mode="multiple"
                style={{ width: 300 }}
                value={
                  // If all models are selected, show "Tất cả mẫu xe" in the display
                  modelNames.length === modelOptions.length - 1 && modelNames.length > 0
                    ? [...modelNames, ""]
                    : modelNames
                }
                onChange={handleModelChange}
                options={modelOptions}
                placeholder="Chọn mẫu xe"
                maxTagCount="responsive"
              />
            </div>

            <div className="filter-item">
              <label>Trạng thái:</label>
              <Select
                mode="multiple"
                style={{ width: 200 }}
                value={
                  // If all statuses are selected, show "Tất cả trạng thái" in the display
                  statuses.length === statusOptions.length - 1 && statuses.length > 0
                    ? [...statuses, ""]
                    : statuses
                }
                onChange={handleStatusChange}
                options={statusOptions}
                placeholder="Chọn trạng thái"
                maxTagCount="responsive"
              />
            </div>

            <div className="filter-item">
              <label>Thời gian:</label>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
                format="DD/MM/YYYY"
                style={{ width: 300 }}
              />
            </div>

            <div className="filter-item">
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={loading}
              >
                Xem
              </Button>
            </div>

            <div className="filter-item">
              <Button
                type="default"
                icon={<PlusOutlined />}
                onClick={handleCreateContractWithSelection}
              >
                Tạo hợp đồng
                {selectionState && (() => {
                  const isSingleDay = selectionState.startDay.format("DD/MM") === selectionState.endDay.format("DD/MM");
                  const carsText = selectionState.licensePlates.length > 1
                    ? `${selectionState.licensePlates.length} xe`
                    : selectionState.licensePlates[0];
                  return isSingleDay
                    ? ` (${carsText})`
                    : ` (${carsText}: ${selectionState.startDay.format("DD/MM")} - ${selectionState.endDay.format("DD/MM")})`;
                })()}
              </Button>
            </div>
          </div>
        </div>

        {/* Grid Section */}
        {!hasSearched ? (
          <div className="schedule-empty">
            <p>Vui lòng chọn filter và bấm nút "Xem" để xem lịch đặt xe</p>
          </div>
        ) : loading ? (
          <LoadingIndicator />
        ) : (
          <div className="schedule-grid">
            {/* Header Row - Days */}
            <div className="schedule-grid-header">
              <div className="schedule-cell-label">Mẫu xe / Xe</div>
              {daysInRange.map((day) => (
                <div key={day.format("YYYY-MM-DD")} className="schedule-cell-day">
                  {day.format("DD/MM")}
                </div>
              ))}
            </div>

            {/* Data Rows */}
            {Object.entries(groupedData).map(([model, cars]) => (
              <React.Fragment key={model}>
                {/* Model Row */}
                <div className="schedule-row-model">
                  <div className="schedule-cell-label">{model}</div>
                  {daysInRange.map(() => (
                    <div key={`${model}-empty`} className="schedule-cell"></div>
                  ))}
                </div>

                {/* Car Rows */}
                {Object.entries(cars).map(([licensePlate, contracts]) => {
                  // Find carId from allCars based on licensePlate
                  const carInfo = allCars.find((car) => car.licensePlate === licensePlate);
                  const carId = carInfo?.id || "";
                  const carStatus = carInfo?.status;

                  return (
                    <div key={`${model}-${licensePlate}`} className="schedule-row-car">
                      <div className="schedule-cell-label">
                        {licensePlate}
                        {getCarStatusIcon(carStatus)}
                      </div>
                      {daysInRange.map((day) => {
                        // Check if this cell is in selection range
                        const isSelected = isCellSelected(day, carId);

                        return (
                          <div
                            key={`${model}-${licensePlate}-${day.format("YYYY-MM-DD")}`}
                            className={`schedule-cell schedule-cell-day-content ${isSelected ? "schedule-cell-selected" : ""}`}
                            onMouseDown={() => handleCellMouseDown(day, carId, licensePlate, model)}
                            onMouseEnter={() => handleCellMouseEnter(day, carId, licensePlate, model)}
                            onMouseUp={handleMouseUp}
                            style={{ cursor: "pointer", userSelect: "none" }}
                          >
                            {contracts
                              .filter((contract) => {
                                const barPos = calculateBarPosition(
                                  contract.startDate,
                                  contract.endDate,
                                  day
                                );
                                return barPos !== null;
                              })
                              .map((contract) => {
                                const barPos = calculateBarPosition(
                                  contract.startDate,
                                  contract.endDate,
                                  day
                                );
                                if (!barPos) return null;

                                return (
                                  <div
                                    key={`${contract.contractCarId}-${day.format("YYYY-MM-DD")}`}
                                    className="schedule-bar"
                                    style={{
                                      left: barPos.left,
                                      width: barPos.width,
                                      backgroundColor: getStatusColor(contract.status),
                                    }}
                                    onMouseDown={(e) => {
                                      e.stopPropagation(); // Prevent cell selection when clicking bar
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent cell click when clicking bar
                                      handleBarClick(contract);
                                    }}
                                    title={`${contract.customerName} (${contract.customerPhone})\n${formatDateDMY(contract.startDate)} → ${formatDateDMY(contract.endDate)}\nClick để xem chi tiết`}
                                  />
                                );
                              })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}

            {Object.keys(groupedData).length === 0 && (
              <div className="schedule-empty">
                <p>Không có dữ liệu lịch đặt xe trong khoảng thời gian đã chọn</p>
              </div>
            )}
          </div>
        )}

        {/* Legend Section */}
        <div className="schedule-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: "#d9d9d9" }}></div>
            <span>Đã xác nhận</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: "#1890ff" }}></div>
            <span>Đã giao xe</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: "#faad14" }}></div>
            <span>Đã trả xe</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: "#52c41a" }}></div>
            <span>Hoàn thành</span>
          </div>
        </div>
      </div>

      {/* Contract Detail Modal */}
      <Modal
        title="Thông tin hợp đồng"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedContract(null);
          setSelectedContractCars([]);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setModalVisible(false);
            setSelectedContract(null);
            setSelectedContractCars([]);
          }}>
            Đóng
          </Button>,
          <Button
            key="view"
            type="primary"
            icon={<EyeOutlined />}
            onClick={handleViewContract}
          >
            Xem hợp đồng
          </Button>,
        ]}
        width={600}
      >
        {selectedContract && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Mã hợp đồng">
              {selectedContract.contractCode}
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              {selectedContract.customerName}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {selectedContract.customerPhone}
            </Descriptions.Item>
            <Descriptions.Item label="Danh sách xe">
              {loadingContractCars ? (
                <span>Đang tải...</span>
              ) : selectedContractCars.length > 0 ? (
                <div>
                  {selectedContractCars.slice(0, 3).map((car, index) => (
                    <span key={car.id}>
                      {car.carModel} ({car.licensePlate})
                      {index < Math.min(selectedContractCars.length, 3) - 1 && " ; "}
                    </span>
                  ))}
                  {selectedContractCars.length > 3 && (
                    <span style={{ color: "#1890ff", fontWeight: 500 }}>
                      {" "}+{selectedContractCars.length - 3} xe
                    </span>
                  )}
                </div>
              ) : (
                <span>
                  {selectedContract.carModel} ({selectedContract.licensePlate})
                </span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày thuê">
              {formatDateDMY(selectedContract.startDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày trả">
              {formatDateDMY(selectedContract.endDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  backgroundColor: getStatusColor(selectedContract.status),
                  color: "#fff",
                  fontWeight: 500,
                }}
              >
                {selectedContract.status === "CONFIRMED" && "Đã xác nhận"}
                {selectedContract.status === "DELIVERED" && "Đã giao xe"}
                {selectedContract.status === "RETURNED" && "Đã trả xe"}
                {selectedContract.status === "COMPLETED" && "Hoàn thành"}
                {selectedContract.status === "CANCELLED" && "Đã hủy"}
              </span>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </ContainerBase>
  );
};

export default ContractSchedule;

