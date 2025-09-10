function DemoDisclaimer() {
  return (
    <section className="bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          مقایسه نسخه‌ها
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr className="border-gray-50">
                <th className="px-6 py-4 text-right text-lg font-semibold text-gray-800">
                  امکانات
                </th>
                <th className="px-6 py-4 text-center text-lg font-semibold text-gray-800">
                  نسخه ساده
                </th>
                <th className="px-6 py-4 text-center text-lg font-semibold text-gray-800">
                  نسخه کامل
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 font-medium text-right text-gray-500">
                  ثبت‌نام هنرجو
                </td>
                <td className="px-6 py-4 font-medium text-center text-green-600">
                  ✅
                </td>
                <td className="px-6 py-4 font-medium text-center text-green-600">
                  ✅
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-right text-gray-500">
                  ذخیره اطلاعات
                </td>
                <td className="px-6 py-4 text-center text-red-500 text-xl">
                  ❌
                </td>
                <td className="px-6 py-4 font-medium text-center text-green-600">
                  ✅
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-right text-gray-500">
                  داشبورد کاربر
                </td>
                <td className="px-6 py-4 text-center text-red-500 text-xl">
                  ❌
                </td>
                <td className="px-6 py-4 font-medium text-center text-green-600">
                  ✅
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-right text-gray-500">
                  انتخاب تاریخ کلاس
                </td>
                <td className="px-6 py-4 text-center text-red-500 text-xl">
                  ❌
                </td>
                <td className="px-6 py-4 font-medium text-center text-green-600">
                  ✅
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-right text-gray-500">
                  پرداخت آنلاین
                </td>
                <td className="px-6 py-4 text-center text-red-500 text-xl">
                  ❌
                </td>
                <td className="px-6 py-4 font-medium text-center text-green-600">
                  ✅
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-right text-gray-500">
                  پنل مربی
                </td>
                <td className="px-6 py-4 text-center text-red-500 text-xl">
                  ❌
                </td>
                <td className="px-6 py-4 font-medium text-center text-green-600">
                  ✅
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default DemoDisclaimer;
