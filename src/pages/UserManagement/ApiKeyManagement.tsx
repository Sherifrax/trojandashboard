import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import BasicTableOne from "../../components/tables/BasicTables/userManagementTable";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button";
import PageMeta from "../../components/common/PageMeta";

// Import from the API service
import { useSearchApiKeysQuery } from "../../services/ApiKey/search";
import { useSaveApiKeyMutation } from "../../services/ApiKey/save";

// Interfaces for API Key
interface ApiKey {
  apiKey: string | null;
  clientName: string;
  isActive: boolean;
  isIpCheck: boolean;
  isCountryCheck: boolean;
  isRegionCheck: boolean;
}

export default function ApiKeyManagement() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // State for filter visibility
  const [formData, setFormData] = useState<ApiKey>({
    apiKey: "",
    clientName: "",
    isActive: false,
    isIpCheck: false,
    isCountryCheck: false,
    isRegionCheck: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState({
    isActive: false,
    isIpCheck: false,
    isCountryCheck: false,
    isRegionCheck: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const apiKeysPerPage = 8;

  // Use the search API hook
  const { data: searchApiKeys, refetch } = useSearchApiKeysQuery({
    clientName: searchQuery,
    isActive: filters.isActive ? 1 : -1,
    isIpCheck: filters.isIpCheck ? 1 : -1,
    isCountryCheck: filters.isCountryCheck ? 1 : -1,
    isRegionCheck: filters.isRegionCheck ? 1 : -1,
  });

  // Use the save API mutation hook
  const [saveApiKey] = useSaveApiKeyMutation();

  useEffect(() => {
    if (searchApiKeys) {
      setApiKeys(searchApiKeys);
    }
  }, [searchApiKeys]);

  // Handle form submit for saving API keys
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Construct the payload, ensuring apiKey is null if not provided
        const payload = {
          apiKey: formData.apiKey || null, // Set to null if formData.apiKey is not provided
          clientName: formData.clientName,
          isActive: formData.isActive,
          isIpCheck: formData.isIpCheck,
          isCountryCheck: formData.isCountryCheck,
          isRegionCheck: formData.isRegionCheck,
        };

        console.log("Payload:", payload); // Debugging: Log the payload

        // Call the save API
        await saveApiKey(payload).unwrap();

        // Update local state after saving
        setApiKeys((prev) => [...prev, payload]);

        // Reset form and close modal
        setIsFormOpen(false);
        setFormData({
          apiKey: null, // Reset apiKey to null
          clientName: "",
          isActive: false,
          isIpCheck: false,
          isCountryCheck: false,
          isRegionCheck: false,
        });

        // Refetch the API keys after saving
        refetch();
      } catch (error) {
        console.error("Error saving API key:", error);
      }
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.clientName) newErrors.clientName = "Client Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form data change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFilters((prev) => ({ ...prev, [name]: checked }));
    setCurrentPage(1); // Reset to first page on new filter
  };

  // Filtered API Keys based on search query and filters
  const filteredApiKeys = apiKeys.filter((key) => {
    const matchesSearch = key.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesActive = !filters.isActive || key.isActive;
    const matchesIpCheck = !filters.isIpCheck || key.isIpCheck;
    const matchesCountryCheck = !filters.isCountryCheck || key.isCountryCheck;
    const matchesRegionCheck = !filters.isRegionCheck || key.isRegionCheck;

    return matchesSearch && matchesActive && matchesIpCheck && matchesCountryCheck && matchesRegionCheck;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredApiKeys.length / apiKeysPerPage);
  const currentApiKeys = filteredApiKeys.slice(
    (currentPage - 1) * apiKeysPerPage,
    currentPage * apiKeysPerPage
  );

  return (
    <>
      <PageMeta title="Api Key Management" description="" />
      <PageBreadcrumb pageTitle="API Key Management" />
      <div className="space-y-4 relative">
        {/* Enhanced Search and Filter Section */}
        <div className="flex gap-4 items-center w-full">
          <div className="relative flex-1">
            <div className="flex rounded-lg shadow-sm hover:shadow-md transition-shadow w-full">
              {/* Search Icon on the Left */}
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              {/* Search Input */}
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>
          </div>
          {/* Filter Button */}
          <Button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="px-6 py-3 border rounded-lg bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-700 transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-700 linearGradient(to right bottom, rgb(42, 142, 229), rgb(20, 13, 206)))"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </Button>

          {/* Add New Button */}
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors text-lg"
          >
            <span className="pr-2 text-xl">+</span>Add
          </Button>
        </div>

        {/* Enhanced Filter Panel */}
        <div
          className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
            isFilterOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ zIndex: 1000 }}
        >
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">Advanced Filters</h3>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-500 uppercase">Status Filters</h4>
              <div className="space-y-3">
                {[
                  { label: "Active", key: "isActive" },
                  { label: "IP Check", key: "isIpCheck" },
                  { label: "Country Check", key: "isCountryCheck" },
                  { label: "Region Check", key: "isRegionCheck" },
                ].map((filter) => (
                  <label key={filter.key} className="flex items-center space-x-3 group">
                    <input
                      type="checkbox"
                      checked={filters[filter.key as keyof typeof filters]}
                      onChange={() => setFilters(prev => ({
                        ...prev,
                        [filter.key]: !prev[filter.key as keyof typeof filters]
                      }))}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 group-hover:border-blue-400"
                    />
                    <span className="text-gray-700 group-hover:text-gray-900 text-lg">{filter.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 border-t border-gray-200 pt-6">
              <Button
                onClick={() => setFilters({
                  isActive: false,
                  isIpCheck: false,
                  isCountryCheck: false,
                  isRegionCheck: false,
                })}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 text-lg"
              >
                Clear All
              </Button>
              <Button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Table and Pagination */}
        <ComponentCard title="Manage API Keys">
          <BasicTableOne
            apiKeys={currentApiKeys}
            onEdit={(apiKey) => {
              setFormData(apiKey);
              setIsFormOpen(true);
            }}
          />
        </ComponentCard>

        {/* Pagination */}
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            {"<<"}
          </Button>
          <Button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            {"<"}
          </Button>
          <span className="flex items-center gap-2 dark:text-white/40">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            {">"}
          </Button>
          <Button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            {">>"}
          </Button>
        </div>
      </div>

      {/* Add/Edit API Key Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} className="max-w-md">
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-xl font-semibold mb-6 dark:text-white/90">
            {formData.apiKey ? "Edit API Key" : "Add New API Key"}
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 dark:text-gray-400">Client Name</label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded ${
                errors.clientName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.clientName && (
              <p className="text-red-500 text-sm mt-1">{errors.clientName}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 dark:text-gray-400">Active</label>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="w-5 h-5"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 dark:text-gray-400">IP Check</label>
            <input
              type="checkbox"
              name="isIpCheck"
              checked={formData.isIpCheck}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isIpCheck: e.target.checked }))
              }
              className="w-5 h-5"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 dark:text-gray-400">Country Check</label>
            <input
              type="checkbox"
              name="isCountryCheck"
              checked={formData.isCountryCheck}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isCountryCheck: e.target.checked }))
              }
              className="w-5 h-5"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 dark:text-gray-400">Region Check</label>
            <input
              type="checkbox"
              name="isRegionCheck"
              checked={formData.isRegionCheck}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isRegionCheck: e.target.checked }))
              }
              className="w-5 h-5"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 mr-4 px-6 py-3 text-lg"
              onClick={() => setIsFormOpen(false)}
            >
              Cancel
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 text-lg">
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}