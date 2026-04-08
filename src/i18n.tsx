import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type LanguageCode = 'vi' | 'en';
const STORAGE_KEY = 'app_language';

function isLanguageCode(value: unknown): value is LanguageCode {
  return value === 'vi' || value === 'en';
}

function resolveInitialLanguage(): LanguageCode {
  if (typeof window === 'undefined') {
    return 'vi';
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (isLanguageCode(saved)) {
    return saved;
  }

  return window.navigator.language.toLowerCase().startsWith('en') ? 'en' : 'vi';
}

const TRANSLATIONS = {
  vi: {
    common: {
      skipToContent: 'Bỏ qua điều hướng và đến nội dung chính',
      goBackHome: '← Quay về trang chủ',
      termsAndPrivacy: 'Bằng cách đăng nhập, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.',
      language: 'Ngôn ngữ',
      switchToVietnamese: 'Chuyển sang tiếng Việt',
      switchToEnglish: 'Chuyển sang tiếng Anh',
      public: 'Công khai',
      private: 'Riêng tư'
    },
    app: {
      authWarningProfileRead: 'Không đọc được profile Firestore. Vui lòng kiểm tra Firestore Rules cho collection users.',
      loading: 'Đang tải...'
    },
    dashboard: {
      navDashboard: 'Dashboard',
      navMyStores: 'Cửa hàng của tôi',
      navStore: 'Cửa hàng',
      logout: 'Đăng xuất',
      openNavigationMenu: 'Mở menu điều hướng',
      closeNavigationMenu: 'Đóng menu điều hướng',
      menu: 'Menu',
      defaultAvatar: 'Avatar mặc định'
    },
    storeManager: {
      updateVisibilityError: 'Không thể cập nhật trạng thái menu. Vui lòng thử lại.',
      tabQr: 'Mã QR',
      tabMenu: 'Quản lý Menu',
      tabTheme: 'Giao diện',
      tabInfo: 'Thông tin cửa hàng',
      backToStores: 'Quay lại danh sách cửa hàng',
      viewMenu: 'Xem Menu',
      changeTemplate: 'Đổi template',
      switchToPrivate: 'Chuyển về Private',
      switchToPublic: 'Chuyển Public'
    },
    storeList: {
      deleteWarningMessage: 'Toàn bộ danh mục và món ăn liên quan sẽ bị xóa vĩnh viễn.',
      pageTitle: 'Cửa hàng của tôi',
      addStore: 'Thêm cửa hàng',
      openStoreManagerAria: 'Mở trang quản lý cho cửa hàng {storeName}',
      active: 'Đang hoạt động',
      edit: 'Chỉnh sửa',
      deleteStoreAria: 'Xóa cửa hàng {storeName}',
      manageQrMenu: 'Quản lý QR & Menu',
      emptyTitle: 'Chưa có cửa hàng nào',
      emptyDescription: 'Bắt đầu hành trình tạo Menu số thông minh của bạn bằng cách thiết lập cửa hàng đầu tiên ngay bây giờ.',
      createFirstStore: 'Tạo cửa hàng đầu tiên',
      addStoreModalTitle: 'Thêm cửa hàng mới',
      closeCreateStoreModal: 'Đóng cửa sổ tạo cửa hàng',
      storeNameLabel: 'Tên cửa hàng',
      storeNamePlaceholder: 'Ví dụ: My Coffee Shop',
      creating: 'Đang tạo...',
      createStore: 'Tạo cửa hàng',
      deleteStoreTitle: 'Xóa cửa hàng "{storeName}"?',
      cancel: 'Hủy',
      deleting: 'Đang xóa...',
      deleteStore: 'Xóa cửa hàng'
    },
    dashboardOverview: {
      unnamedStore: 'Cửa hàng chưa đặt tên',
      title: 'Tổng quan Dashboard',
      welcomeBack: 'Chào mừng quay trở lại, {name}!',
      analyticsRangeAria: 'Chọn khoảng thời gian analytics',
      last7Days: '7 ngày',
      last30Days: '30 ngày',
      addNewStore: 'Thêm cửa hàng mới',
      totalStores: 'Tổng cửa hàng',
      totalCategories: 'Tổng danh mục',
      totalProducts: 'Tổng sản phẩm',
      menuViews: 'Lượt xem menu',
      detailClicks: 'Click chi tiết',
      topStoresByViews: 'Top cửa hàng theo lượt xem Menu',
      dataInLastDays: 'Dữ liệu trong {days} ngày gần nhất.',
      noAnalyticsData: 'Chưa có dữ liệu analytics trong khoảng thời gian đã chọn.',
      storeColumn: 'Cửa hàng',
      viewsColumn: 'Lượt xem',
      detailClicksColumn: 'Click chi tiết'
    },
    storeOverview: {
      welcomeTitle: 'Chào mừng bạn!',
      welcomeDescription: 'Bạn chưa thiết lập thông tin cửa hàng. Hãy bắt đầu bằng cách cập nhật thông tin cơ bản để tạo Menu.',
      setupNow: 'Thiết lập ngay',
      menuMetrics: 'Chỉ số menu',
      statsRangeAria: 'Chọn khoảng thời gian thống kê',
      yourMenuQr: 'Mã QR Menu của bạn',
      downloadQr: 'Tải mã QR',
      quickGuide: 'Hướng dẫn nhanh',
      tip1Title: 'Cập nhật thông tin',
      tip1Description: 'Vào phần Thông tin cửa hàng để cập nhật Logo, Ảnh bìa và giới thiệu cửa hàng.',
      tip2Title: 'Tạo danh mục',
      tip2Description: 'Tạo các danh mục như: Đồ uống, Chăm sóc, Trẻ em...',
      tip3Title: 'Thêm sản phẩm',
      tip3Description: 'Thêm hình ảnh, mô tả và giá cho từng sản phẩm trong danh mục.',
      tip4Title: 'In mã QR',
      tip4Description: 'Tải mã QR'
    },
    menuManagement: {
      edit: 'Sửa',
      delete: 'Xóa',
      setupStoreFirst: 'Vui lòng thiết lập thông tin cửa hàng trước khi quản lý Menu.',
      priceFromRange: 'Từ {min} - {max}',
      confirmDeleteCategoryMessage: 'Bạn có chắc chắn muốn xóa danh mục này? Tất cả sản phẩm trong danh mục cũng sẽ bị xóa vĩnh viễn.',
      confirmDeleteProductMessage: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
      categories: 'Danh mục',
      noCategories: 'Chưa có danh mục nào',
      products: 'Sản phẩm',
      addProduct: 'Thêm sản phẩm',
      emptyCategoryTitle: 'Danh mục này hiện chưa có món',
      emptyCategoryDescription: 'Bổ sung ngay sản phẩm mới để phong phú hơn sự lựa chọn cho thực khách.',
      selectOrCreateCategory: 'Vui lòng chọn hoặc tạo danh mục trước khi quản lý sản phẩm.',
      confirmDeleteTitle: 'Xác nhận xóa',
      cancel: 'Hủy',
      deleting: 'Đang xóa...',
      editCategory: 'Sửa danh mục',
      addCategory: 'Thêm danh mục',
      categoryName: 'Tên danh mục',
      categoryNamePlaceholder: 'Ví dụ: Món chính, Đồ uống...',
      saving: 'Đang lưu...',
      saveCategory: 'Lưu danh mục',
      uploadImageError: 'Không thể tải ảnh lên. Vui lòng vào Firebase Console > Build > Storage > Get started để tạo bucket.',
      invalidPriceAlert: 'Vui lòng nhập giá hợp lệ (số nguyên >= 0).',
      editProduct: 'Sửa sản phẩm',
      currentStoreCurrency: 'Tiền tệ hiện tại của cửa hàng',
      productName: 'Tên món ăn/sản phẩm',
      productNamePlaceholder: 'Ví dụ: Phở bò đặc biệt',
      category: 'Danh mục',
      shortDescription: 'Mô tả ngắn',
      shortDescriptionPlaceholder: 'Tóm tắt trong 1-2 câu',
      longDescription: 'Mô tả chi tiết',
      longDescriptionPlaceholder: 'Mô tả chi tiết hơn về nguyên liệu, đồ ăn...',
      price: 'Giá bán',
      pricePlaceholder: 'Nhập giá theo {currency}, ví dụ {example}',
      displayPrice: 'Giá hiển thị: {price}',
      emptyPriceHint: 'Bạn có thể để trống rồi nhập giá sau.',
      variantPricingNotice: 'Đang dùng giá theo variants. Giá đơn đã được ẩn để tránh xung đột dữ liệu hiển thị.',
      productImage: 'Hình ảnh sản phẩm',
      previewImageAlt: 'Xem trước ảnh sản phẩm',
      uploadImage: 'Tải ảnh lên',
      hashtags: 'Hashtags (thẻ)',
      hashtagPlaceholder: '#ví dụ',
      add: 'Thêm',
      variants: 'Variants (tùy chọn giá)',
      currencyApplied: 'Đơn vị tiền tệ đang áp dụng',
      addVariant: 'Thêm variant',
      noVariants: 'Chưa có variant. Tạo variant để hiển thị đoạn giá Từ - Đến.',
      variantNamePlaceholder: 'Tên variant, ví dụ: Nhỏ',
      variantPricePlaceholder: 'Giá ({currency})',
      defaultVariant: 'Mặc định',
      saveProduct: 'Lưu sản phẩm'
    },
    themeEditor: {
      saveSuccess: 'Đã lưu tùy chỉnh giao diện thành công.',
      saveError: 'Không thể lưu giao diện. Vui lòng thử lại.',
      resetSuccess: 'Đã đặt lại giao diện về giá trị hiện tại của cửa hàng.',
      title: 'Giao diện Menu',
      subtitle: 'Tùy chỉnh màu, font, bố cục và QR trong một màn hình.',
      reset: 'Đặt lại',
      saving: 'Đang lưu...',
      saveChanges: 'Lưu thay đổi',
      templateSectionTitle: 'Template',
      templateSectionSubtitle: 'Chọn layout menu hiện tại.',
      templateCount: '{count} mẫu',
      currentlySelected: 'Đang chọn',
      applying: 'Đang áp dụng',
      chooseTemplate: 'Chọn mẫu',
      preview: 'Xem trước',
      phoneMockup: 'Phone mockup',
      previewDescription: 'Mô phỏng realtime theo template đang chọn',
      livePreview: 'Live preview',
      font: 'Font',
      currency: 'Tiền tệ',
      previewCityFallback: 'Huế',
      previewStoreDescriptionDetailed: 'Mô tả chi tiết về cửa hàng của bạn',
      previewTrendyCafe: 'Quán cf thời thượng',
      previewCoffeeShopBio: 'Quán coffee tọa lạc tại thành phố Huế.',
      previewCategoriesLabel: 'Danh Mục',
      previewChooseDish: 'Chọn món bạn muốn thử',
      previewChooseProduct: 'Chọn sản phẩm bạn muốn thử',
      previewCoffee: 'Cà phê',
      previewMatcha: 'Matcha',
      previewFeatured: 'Nổi bật',
      previewNewDish: 'Món mới',
      previewDetail: 'Chi tiết',
      previewFromRange: 'Từ {min} - {max}',
      previewColdBrewDescription: 'Cà phê Arabica được ủ lạnh trong 8h',
      previewAmericanoDescription: 'Khác với cà phê Việt Nam, cà phê kiểu Mỹ...',
      previewCoffeeTag: '#cà phê',
      previewProduct1Name: 'Cơm Gà Sốt Mơ',
      previewProduct1Description: 'Cơm trắng mềm, gà xé sốt mơ chua ngọt.',
      previewProduct2Name: 'Salad Rau Củ Miễn Phí',
      previewProduct2Description: 'Tươi mát, kèm sốt mè rang đặc trưng.',
      previewProduct3Name: 'Trà Đá Thơm Lạnh',
      previewProduct3Description: 'Giữ ấm dư vị mùa hè với hương trà tự nhiên.',
      template: {
        classic: {
          name: 'Classic',
          description: 'Layout danh sách truyền thống.',
          vibe: 'Thân thuộc',
          bestFor: 'Menu nhiều món'
        },
        modernGrid: {
          name: 'Modern Grid',
          description: 'Grid cards, icon categories và banner hiện đại.',
          vibe: 'Hiện đại',
          bestFor: 'Brand trẻ'
        },
        vibrant: {
          name: 'Vibrant',
          description: 'Thiết kế sống động với cam sôi động.',
          vibe: 'Năng lượng',
          bestFor: 'Combo nổi bật'
        },
        minimal: {
          name: 'Minimal',
          description: 'Thiết kế tối giản, sạch sẽ và chuyên nghiệp.',
          vibe: 'Tinh gọn',
          bestFor: 'Tập trung nội dung'
        },
        bakery: {
          name: 'Bakery',
          description: 'Editorial ấm áp, ảnh lớn, phù hợp quán bánh và cà phê.',
          vibe: 'Ấm áp',
          bestFor: 'Ảnh sản phẩm'
        },
        organicMarket: {
          name: 'Organic Market',
          description: 'Phong cách panel organic góc cạnh, khác biệt rõ với Bakery.',
          vibe: 'Mộc mạc',
          bestFor: 'Brand organic'
        },
        coffeeAtelier: {
          name: 'Coffee Atelier',
          description: 'Hero typography, tông cà phê cao cấp và modal sản phẩm đậm chất studio.',
          vibe: 'Studio',
          bestFor: 'Premium coffee'
        },
        signatureMarket: {
          name: 'Signature Market',
          description: 'Soft editorial bo tròn, nhịp trình bày thoáng và nhận diện tách biệt khỏi Coffee Atelier.',
          vibe: 'Êm dịu',
          bestFor: 'Menu seasonal'
        },
        botanicalSketch: {
          name: 'Botanical Sketchbook',
          description: 'Monotone sketch với chất giấy mộc, card bo mềm và modal chi tiết đầy đủ.',
          vibe: 'Thủ công',
          bestFor: 'Storytelling'
        },
        fluidMonochrome: {
          name: 'Fluid Monochrome',
          description: 'Monochrome hữu cơ, card stack mềm và modal chi tiết kiểu liquid.',
          vibe: 'Tối giản đậm nét',
          bestFor: 'Brand cá tính'
        }
      }
    },
    notFound: {
      title: 'Không tìm thấy trang',
      description: 'Trang bạn đang cố truy cập không tồn tại, đã bị xóa hoặc đường dẫn không chính xác.',
      goHome: 'Quay lại Trang Chủ'
    },
    publicMenu: {
      notFoundTitle: 'Không tìm thấy Menu',
      notFoundDescription: 'Vui lòng kiểm tra lại mã QR hoặc đường dẫn.',
      privateNotice: 'Menu đang trong trạng thái cập nhật, vui lòng quay lại sau.',
      filterDisabledReason: 'Filter/Sort tạm khóa khi menu đang ở chế độ Private.'
    },
    publicMenuFilters: {
      disabledReason: 'Filter/Sort tạm khóa khi menu đang ở chế độ Private.',
      trigger: 'Filter/Sort',
      panelTitle: 'Lọc sản phẩm',
      closePanel: 'Đóng bộ lọc',
      searchLabel: 'Tìm kiếm',
      searchPlaceholder: 'Tên món, mô tả, hashtag...',
      sortLabel: 'Sắp xếp',
      sortDefault: 'Mặc định',
      sortPriceAsc: 'Giá tăng dần',
      sortPriceDesc: 'Giá giảm dần',
      sortNameAsc: 'Tên A-Z',
      sortNameDesc: 'Tên Z-A',
      withImage: 'Có ảnh',
      withVariants: 'Có biến thể',
      visibleCount: '{count} sản phẩm đang hiển thị',
      totalCount: 'Tổng {count}',
      clearAll: 'Xóa tất cả bộ lọc'
    },
    menuUi: {
      privatePreviewOwnerNotice: 'Bạn đang xem menu ở chế độ Private. Đây là bản xem trước cho chủ cửa hàng, khách bên ngoài sẽ không truy cập được.',
      fromPriceRange: 'Từ {min} - {max}',
      productDescriptionFallback: 'Không có mô tả cho sản phẩm này.',
      viewDetails: 'Xem chi tiết',
      viewProductDetailsAria: 'Xem chi tiết sản phẩm {productName}',
      categoriesLabel: 'Danh mục',
      chooseProductPrompt: 'Chọn sản phẩm bạn muốn thử',
      cravingPrompt: 'Hôm nay bạn muốn dùng gì?',
      welcomeTo: 'Chào mừng đến với',
      menuCategories: 'Danh mục menu',
      noProductsTitle: 'Danh mục này chưa có sản phẩm',
      noProductsDescription: 'Hãy chọn danh mục khác để xem thêm món mới.',
      productDetailTitle: 'Chi tiết sản phẩm',
      priceLabel: 'Mức giá',
      descriptionLabel: 'Mô tả',
      detailedDescriptionLabel: 'Mô tả chi tiết',
      variantsLabel: 'Biến thể',
      variantPricesLabel: 'Giá biến thể',
      variantOptionsLabel: 'Biến thể và lựa chọn',
      optionsLabel: 'Tùy chọn',
      defaultVariant: 'Mặc định',
      close: 'Đóng',
      done: 'Xong',
      poweredBy: 'Cung cấp bởi MenuQRGenerate',
      greeting: 'Xin chào',
      freshBatchDaily: 'Mẻ mới mỗi ngày',
      openEveryday: 'Mở cửa mỗi ngày',
      freshToday: 'Tươi mới hôm nay'
    },
    login: {
      welcome: 'Chào mừng trở lại',
      subtitle: 'Bắt đầu quản lý menu của bạn ngay hôm nay',
      button: 'Đăng nhập với Google',
      processing: 'Đang xử lý...',
      error: {
        unauthorizedDomain: 'Domain hiện tại chưa được thêm trong Firebase Auth > Authorized domains.',
        unsupportedEnvironment: 'Google login yêu cầu HTTPS (hoặc localhost). Domain HTTP công khai sẽ bị chặn.',
        popupBlocked: 'Popup đăng nhập bị chặn. Vui lòng cho phép popup trong trình duyệt.',
        popupClosed: 'Bạn đã đóng popup đăng nhập trước khi hoàn tất.',
        networkFailed: 'Lỗi mạng khi kết nối Firebase Auth. Vui lòng kiểm tra internet/domain.',
        failed: 'Đăng nhập thất bại ({code}).'
      }
    },
    landing: {
      brand: 'MenuQRGenerate',
      heroTitleLine1: 'Menu Kỹ Thuật Số',
      heroTitleLine2: 'Chuyên Nghiệp Trong 5 Phút',
      heroDescription: 'Giải pháp tạo QR Menu tối ưu cho cửa hàng, quán cafe, dịch vụ. Giúp khách hàng xem món nhanh chóng, an toàn và hiện đại.',
      ctaFreeMenu: 'Tạo Menu Miễn Phí',
      ctaViewDemo: 'Xem Demo',
      whyChooseHeading: 'Tại sao chọn MenuQRGenerate?',
      featureEasyManageTitle: 'Quản lý dễ dàng',
      featureEasyManageDescription: 'Cập nhật sản phẩm, giá cả, hình ảnh chỉ trong vài giây. Không cần in lại menu giấy.',
      featureOptimizeMobileTitle: 'Tối ưu Mobile',
      featureOptimizeMobileDescription: 'Menu hiển thị mượt mà trên mọi thiết bị di động. Khách hàng không cần cài ứng dụng.',
      featureAutoQrTitle: 'Tạo QR Tự Động',
      featureAutoQrDescription: 'Hệ thống tự động tạo mã QR duy nhất cho cửa hàng của bạn. Tải về và in ngay.',
      demoHeading: 'Xem Demo Giao Diện',
      demoDescription: 'Giao diện thực tế từ các màn hình quản lý. Thiết kế dành cho laptop, rõ nét và không quá nhỏ.',
      demoImageAlt1: 'Dashboard tổng quan menu',
      demoImageAlt2: 'Thêm cửa hàng',
      demoImageAlt3: 'Tổng quan quản lý menu',
      demoImageAlt4: 'Trình quản lý sản phẩm và hashtags',
      screenshotDetails: 'Màn hình đang hiển thị:',
      selectAnotherImage: 'Chọn ảnh khác:',
      viewLargeImage: 'Xem ảnh lớn',
      demoCaption: 'Dành cho laptop: đang hiển thị giao diện quản lý menu với yếu tố rõ ràng, độ tương phản cao.',
      modalTitle: 'Xem ảnh lớn',
      closeModal: 'Đóng xem ảnh',
      footer: '© 2026 MenuQRGenerate. All rights reserved.'
    },
    restaurant: {
      pageTitle: 'Thông tin cửa hàng',
      pageSubtitle: 'Quản lý thông tin hiển thị và giao diện menu',
      saveChanges: 'Lưu thay đổi',
      saving: 'Đang lưu...',
      storeInfoTab: 'Thông tin cửa hàng',
      customizeTab: 'Tùy chỉnh',
      sectionHeading: 'Thông tin cửa hàng',
      sectionDescription: 'Thông tin nhận diện và nội dung cơ bản hiển thị trên menu public.',
      nameLabel: 'Tên cửa hàng',
      slugLabel: 'Đường dẫn Menu (Slug)',
      addressLabel: 'Địa chỉ',
      phoneLabel: 'Số điện thoại',
      menuStatusLabel: 'Trạng thái Menu',
      publicLabel: 'Public',
      privateLabel: 'Private',
      publicHint: '(menu sẽ được công khai khi chọn Public)',
      shortBioLabel: 'Giới thiệu ngắn',
      bioPlaceholder: 'Mô tả ngắn về cửa hàng của bạn...',
      logoLabel: 'Logo (Ảnh đại diện)',
      uploadImage: 'Tải ảnh lên',
      coverLabel: 'Ảnh bìa (Cover Image)',
      customizeHeading: 'Tùy chỉnh',
      customizeDescription: 'Màu sắc và typography của menu public. Việc đổi template được thực hiện ở mục Giao diện.',
      primaryColorLabel: 'Màu chủ đạo (Primary Color)',
      secondaryColorLabel: 'Màu nền phụ (Secondary Color)',
      fontFamilyLabel: 'Font Family',
      sizePresetLabel: 'Kích thước hiển thị',
      currencyLabel: 'Tiền tệ',
      previewTitle: 'Preview menu style',
      previewDescription: 'Mẫu xem trước nhanh cho màu sắc và typography của menu public.',
      placeholderName: 'Ví dụ: Phở Gia Truyền',
      placeholderSlug: 'Ví dụ: pho-gia-truyen',
      placeholderAddress: 'Ví dụ: 123 Đường ABC, Quận 1, TP.HCM',
      placeholderPhone: '090...',
      optionLarge: 'Large',
      optionNormal: 'Normal',
      optionCompact: 'Compact',
      errorNameRequired: 'Tên cửa hàng là bắt buộc.',
      errorSlugRequired: 'Đường dẫn (slug) là bắt buộc.',
      errorSlugTaken: 'Đường dẫn (slug) đã tồn tại. Vui lòng chọn tên khác.',
      uploadImageError: 'Không thể tải ảnh lên. Vui lòng kiểm tra Firebase Storage và thử lại.',
      successUpdate: 'Cập nhật thông tin thành công!',
      successCreate: 'Tạo cửa hàng mới thành công!',
      saveError: 'Có lỗi xảy ra khi lưu thông tin.'
    }
  },
  en: {
    common: {
      skipToContent: 'Skip navigation and go to main content',
      goBackHome: '← Back to home',
      termsAndPrivacy: 'By signing in, you agree to our Terms of Service and Privacy Policy.',
      language: 'Language',
      switchToVietnamese: 'Switch to Vietnamese',
      switchToEnglish: 'Switch to English',
      public: 'Public',
      private: 'Private'
    },
    app: {
      authWarningProfileRead: 'Could not read Firestore profile. Please check Firestore Rules for the users collection.',
      loading: 'Loading...'
    },
    dashboard: {
      navDashboard: 'Dashboard',
      navMyStores: 'My stores',
      navStore: 'Store',
      logout: 'Sign out',
      openNavigationMenu: 'Open navigation menu',
      closeNavigationMenu: 'Close navigation menu',
      menu: 'Menu',
      defaultAvatar: 'Default avatar'
    },
    storeManager: {
      updateVisibilityError: 'Could not update menu visibility. Please try again.',
      tabQr: 'QR Code',
      tabMenu: 'Menu Management',
      tabTheme: 'Theme',
      tabInfo: 'Store Information',
      backToStores: 'Back to stores list',
      viewMenu: 'View Menu',
      changeTemplate: 'Change template',
      switchToPrivate: 'Switch to Private',
      switchToPublic: 'Switch to Public'
    },
    storeList: {
      deleteWarningMessage: 'All related categories and products will be permanently deleted.',
      pageTitle: 'My stores',
      addStore: 'Add store',
      openStoreManagerAria: 'Open manager page for store {storeName}',
      active: 'Active',
      edit: 'Edit',
      deleteStoreAria: 'Delete store {storeName}',
      manageQrMenu: 'Manage QR & Menu',
      emptyTitle: 'No stores yet',
      emptyDescription: 'Start your smart digital menu journey by creating your first store now.',
      createFirstStore: 'Create first store',
      addStoreModalTitle: 'Add new store',
      closeCreateStoreModal: 'Close create store dialog',
      storeNameLabel: 'Store name',
      storeNamePlaceholder: 'Example: My Coffee Shop',
      creating: 'Creating...',
      createStore: 'Create store',
      deleteStoreTitle: 'Delete store "{storeName}"?',
      cancel: 'Cancel',
      deleting: 'Deleting...',
      deleteStore: 'Delete store'
    },
    dashboardOverview: {
      unnamedStore: 'Unnamed store',
      title: 'Dashboard Overview',
      welcomeBack: 'Welcome back, {name}!',
      analyticsRangeAria: 'Select analytics time range',
      last7Days: '7 days',
      last30Days: '30 days',
      addNewStore: 'Add new store',
      totalStores: 'Total stores',
      totalCategories: 'Total categories',
      totalProducts: 'Total products',
      menuViews: 'Menu views',
      detailClicks: 'Detail clicks',
      topStoresByViews: 'Top stores by menu views',
      dataInLastDays: 'Data in the last {days} days.',
      noAnalyticsData: 'No analytics data in the selected time range.',
      storeColumn: 'Store',
      viewsColumn: 'Views',
      detailClicksColumn: 'Detail clicks'
    },
    storeOverview: {
      welcomeTitle: 'Welcome!',
      welcomeDescription: 'You have not set up store information yet. Start by updating your basic details to create your menu.',
      setupNow: 'Set up now',
      menuMetrics: 'Menu metrics',
      statsRangeAria: 'Select statistics time range',
      yourMenuQr: 'Your menu QR code',
      downloadQr: 'Download QR',
      quickGuide: 'Quick guide',
      tip1Title: 'Update information',
      tip1Description: 'Go to Store Information to update logo, cover image, and store introduction.',
      tip2Title: 'Create categories',
      tip2Description: 'Create categories such as: Drinks, Care, Kids...',
      tip3Title: 'Add products',
      tip3Description: 'Add image, description, and price for each product in categories.',
      tip4Title: 'Print QR code',
      tip4Description: 'Download QR code'
    },
    menuManagement: {
      edit: 'Edit',
      delete: 'Delete',
      setupStoreFirst: 'Please set up store information before managing the menu.',
      priceFromRange: 'From {min} - {max}',
      confirmDeleteCategoryMessage: 'Are you sure you want to delete this category? All products in this category will be permanently deleted.',
      confirmDeleteProductMessage: 'Are you sure you want to delete this product?',
      categories: 'Categories',
      noCategories: 'No categories yet',
      products: 'Products',
      addProduct: 'Add product',
      emptyCategoryTitle: 'This category has no products yet',
      emptyCategoryDescription: 'Add a new product now to give your customers more choices.',
      selectOrCreateCategory: 'Please select or create a category before managing products.',
      confirmDeleteTitle: 'Confirm deletion',
      cancel: 'Cancel',
      deleting: 'Deleting...',
      editCategory: 'Edit category',
      addCategory: 'Add category',
      categoryName: 'Category name',
      categoryNamePlaceholder: 'Example: Main dishes, Drinks...',
      saving: 'Saving...',
      saveCategory: 'Save category',
      uploadImageError: 'Could not upload image. Please open Firebase Console > Build > Storage > Get started to create a bucket.',
      invalidPriceAlert: 'Please enter a valid price (integer >= 0).',
      editProduct: 'Edit product',
      currentStoreCurrency: 'Current store currency',
      productName: 'Product name',
      productNamePlaceholder: 'Example: Special beef pho',
      category: 'Category',
      shortDescription: 'Short description',
      shortDescriptionPlaceholder: 'Summarize in 1-2 sentences',
      longDescription: 'Detailed description',
      longDescriptionPlaceholder: 'Describe ingredients, taste, and details...',
      price: 'Price',
      pricePlaceholder: 'Enter price in {currency}, e.g. {example}',
      displayPrice: 'Displayed price: {price}',
      emptyPriceHint: 'You can leave this empty and add the price later.',
      variantPricingNotice: 'Variant pricing is enabled. Single price is hidden to avoid display conflicts.',
      productImage: 'Product image',
      previewImageAlt: 'Product image preview',
      uploadImage: 'Upload image',
      hashtags: 'Hashtags (tags)',
      hashtagPlaceholder: '#example',
      add: 'Add',
      variants: 'Variants (price options)',
      currencyApplied: 'Applied currency',
      addVariant: 'Add variant',
      noVariants: 'No variants yet. Create variants to show a From - To price range.',
      variantNamePlaceholder: 'Variant name, e.g. Small',
      variantPricePlaceholder: 'Price ({currency})',
      defaultVariant: 'Default',
      saveProduct: 'Save product'
    },
    themeEditor: {
      saveSuccess: 'Theme customization saved successfully.',
      saveError: 'Could not save theme. Please try again.',
      resetSuccess: 'Theme reset to the store current values.',
      title: 'Menu Theme',
      subtitle: 'Customize colors, fonts, layout, and QR in one screen.',
      reset: 'Reset',
      saving: 'Saving...',
      saveChanges: 'Save changes',
      templateSectionTitle: 'Template',
      templateSectionSubtitle: 'Choose the current menu layout.',
      templateCount: '{count} templates',
      currentlySelected: 'Selected',
      applying: 'Applying',
      chooseTemplate: 'Choose template',
      preview: 'Preview',
      phoneMockup: 'Phone mockup',
      previewDescription: 'Realtime simulation based on selected template',
      livePreview: 'Live preview',
      font: 'Font',
      currency: 'Currency',
      previewCityFallback: 'Hue',
      previewStoreDescriptionDetailed: 'Detailed description of your store',
      previewTrendyCafe: 'Trendy coffee shop',
      previewCoffeeShopBio: 'A cozy coffee shop located in Hue city.',
      previewCategoriesLabel: 'Categories',
      previewChooseDish: 'Choose the dish you want to try',
      previewChooseProduct: 'Choose the product you want to try',
      previewCoffee: 'Coffee',
      previewMatcha: 'Matcha',
      previewFeatured: 'Featured',
      previewNewDish: 'New dishes',
      previewDetail: 'Details',
      previewFromRange: 'From {min} - {max}',
      previewColdBrewDescription: 'Arabica coffee cold-brewed for 8 hours',
      previewAmericanoDescription: 'Unlike Vietnamese coffee, this is an American-style brew...',
      previewCoffeeTag: '#coffee',
      previewProduct1Name: 'Apricot Sauce Chicken Rice',
      previewProduct1Description: 'Soft steamed rice with shredded chicken in a sweet-tangy apricot sauce.',
      previewProduct2Name: 'Fresh Garden Salad',
      previewProduct2Description: 'Refreshing greens served with signature roasted sesame dressing.',
      previewProduct3Name: 'Chilled Herbal Tea',
      previewProduct3Description: 'A refreshing summer-style tea with natural aroma.',
      template: {
        classic: {
          name: 'Classic',
          description: 'Traditional list layout.',
          vibe: 'Familiar',
          bestFor: 'Large menus'
        },
        modernGrid: {
          name: 'Modern Grid',
          description: 'Grid cards, icon categories, and modern banner.',
          vibe: 'Modern',
          bestFor: 'Young brands'
        },
        vibrant: {
          name: 'Vibrant',
          description: 'Energetic design with vivid orange accents.',
          vibe: 'Energetic',
          bestFor: 'Highlighted combos'
        },
        minimal: {
          name: 'Minimal',
          description: 'Clean, minimal, and professional design.',
          vibe: 'Focused',
          bestFor: 'Content clarity'
        },
        bakery: {
          name: 'Bakery',
          description: 'Warm editorial style with large images, ideal for bakery and coffee.',
          vibe: 'Warm',
          bestFor: 'Product imagery'
        },
        organicMarket: {
          name: 'Organic Market',
          description: 'Angular organic panel style, visually distinct from Bakery.',
          vibe: 'Natural',
          bestFor: 'Organic brands'
        },
        coffeeAtelier: {
          name: 'Coffee Atelier',
          description: 'Premium coffee tone with hero typography and studio-like product modal.',
          vibe: 'Studio',
          bestFor: 'Premium coffee'
        },
        signatureMarket: {
          name: 'Signature Market',
          description: 'Soft rounded editorial rhythm with identity distinct from Coffee Atelier.',
          vibe: 'Soft',
          bestFor: 'Seasonal menus'
        },
        botanicalSketch: {
          name: 'Botanical Sketchbook',
          description: 'Monotone sketch style with paper texture, soft cards, and rich detail modal.',
          vibe: 'Craft',
          bestFor: 'Storytelling'
        },
        fluidMonochrome: {
          name: 'Fluid Monochrome',
          description: 'Organic monochrome with soft card stack and liquid-style detail modal.',
          vibe: 'Bold minimal',
          bestFor: 'Distinctive brands'
        }
      }
    },
    notFound: {
      title: 'Page not found',
      description: 'The page you are trying to access does not exist, was removed, or has an invalid URL.',
      goHome: 'Back to Home'
    },
    publicMenu: {
      notFoundTitle: 'Menu not found',
      notFoundDescription: 'Please check the QR code or URL again.',
      privateNotice: 'This menu is currently being updated. Please come back later.',
      filterDisabledReason: 'Filter/Sort is temporarily disabled while the menu is in Private mode.'
    },
    publicMenuFilters: {
      disabledReason: 'Filter/Sort is temporarily disabled while the menu is in Private mode.',
      trigger: 'Filter/Sort',
      panelTitle: 'Filter products',
      closePanel: 'Close filter panel',
      searchLabel: 'Search',
      searchPlaceholder: 'Dish name, description, hashtag...',
      sortLabel: 'Sort',
      sortDefault: 'Default',
      sortPriceAsc: 'Price: low to high',
      sortPriceDesc: 'Price: high to low',
      sortNameAsc: 'Name A-Z',
      sortNameDesc: 'Name Z-A',
      withImage: 'With image',
      withVariants: 'With variants',
      visibleCount: '{count} products shown',
      totalCount: 'Total {count}',
      clearAll: 'Clear all filters'
    },
    menuUi: {
      privatePreviewOwnerNotice: 'You are viewing this menu in Private mode. This preview is visible to the store owner only, external visitors cannot access it.',
      fromPriceRange: 'From {min} - {max}',
      productDescriptionFallback: 'No description available for this product.',
      viewDetails: 'View details',
      viewProductDetailsAria: 'View details for product {productName}',
      categoriesLabel: 'Categories',
      chooseProductPrompt: 'Choose a product you want to try',
      cravingPrompt: 'What are you craving today?',
      welcomeTo: 'Welcome to',
      menuCategories: 'Menu categories',
      noProductsTitle: 'No products in this category',
      noProductsDescription: 'Please choose another category to explore more items.',
      productDetailTitle: 'Product details',
      priceLabel: 'Price range',
      descriptionLabel: 'Description',
      detailedDescriptionLabel: 'Detailed description',
      variantsLabel: 'Variants',
      variantPricesLabel: 'Variant prices',
      variantOptionsLabel: 'Variants and options',
      optionsLabel: 'Options',
      defaultVariant: 'Default',
      close: 'Close',
      done: 'Done',
      poweredBy: 'Powered by MenuQRGenerate',
      greeting: 'Hello',
      freshBatchDaily: 'Fresh batch daily',
      openEveryday: 'Open everyday',
      freshToday: 'Fresh today'
    },
    login: {
      welcome: 'Welcome back',
      subtitle: 'Start managing your menu today',
      button: 'Sign in with Google',
      processing: 'Processing...',
      error: {
        unauthorizedDomain: 'Current domain is not added to Firebase Auth > Authorized domains.',
        unsupportedEnvironment: 'Google login requires HTTPS (or localhost). Public HTTP domains are blocked.',
        popupBlocked: 'Login popup was blocked. Please allow popups in your browser.',
        popupClosed: 'You closed the login popup before completing sign in.',
        networkFailed: 'Network error connecting to Firebase Auth. Please check your internet/domain.',
        failed: 'Login failed ({code}).'
      }
    },
    landing: {
      brand: 'MenuQRGenerate',
      heroTitleLine1: 'Digital Menu',
      heroTitleLine2: 'Professional in 5 Minutes',
      heroDescription: 'A fast QR menu builder for stores, cafes, and services. Let customers browse dishes quickly, safely, and smoothly.',
      ctaFreeMenu: 'Create Free Menu',
      ctaViewDemo: 'View Demo',
      whyChooseHeading: 'Why choose MenuQRGenerate?',
      featureEasyManageTitle: 'Easy management',
      featureEasyManageDescription: 'Update products, prices, and images in seconds. No need to reprint paper menus.',
      featureOptimizeMobileTitle: 'Mobile optimized',
      featureOptimizeMobileDescription: 'Menus render smoothly on all devices. Customers do not need an app.',
      featureAutoQrTitle: 'Auto QR generation',
      featureAutoQrDescription: 'The system creates a unique QR code for your store automatically. Download and print instantly.',
      demoHeading: 'See the interface demo',
      demoDescription: 'Real UI examples from the management dashboard. Designed for laptop screens with clear hierarchy.',
      demoImageAlt1: 'Menu dashboard overview',
      demoImageAlt2: 'Add a store',
      demoImageAlt3: 'Menu management overview',
      demoImageAlt4: 'Product and hashtag manager',
      screenshotDetails: 'Current screen:',
      selectAnotherImage: 'Choose another image:',
      viewLargeImage: 'View large image',
      demoCaption: 'For laptop preview: management UI with clear structure and good contrast.',
      modalTitle: 'View large image',
      closeModal: 'Close preview',
      footer: '© 2026 MenuQRGenerate. All rights reserved.'
    },
    restaurant: {
      pageTitle: 'Store information',
      pageSubtitle: 'Manage display details and menu appearance',
      saveChanges: 'Save changes',
      saving: 'Saving...',
      storeInfoTab: 'Store info',
      customizeTab: 'Customize',
      sectionHeading: 'Store information',
      sectionDescription: 'Branding and core details shown on the public menu.',
      nameLabel: 'Store name',
      slugLabel: 'Menu path (Slug)',
      addressLabel: 'Address',
      phoneLabel: 'Phone number',
      menuStatusLabel: 'Menu status',
      publicLabel: 'Public',
      privateLabel: 'Private',
      publicHint: '(menu becomes public when Public is selected)',
      shortBioLabel: 'Short description',
      bioPlaceholder: 'Short description of your store...',
      logoLabel: 'Logo (Avatar image)',
      uploadImage: 'Upload image',
      coverLabel: 'Cover image',
      customizeHeading: 'Customize',
      customizeDescription: 'Colors and typography for the public menu. Template changes are managed in the Theme page.',
      primaryColorLabel: 'Primary color',
      secondaryColorLabel: 'Secondary color',
      fontFamilyLabel: 'Font family',
      sizePresetLabel: 'Display size',
      currencyLabel: 'Currency',
      previewTitle: 'Preview menu style',
      previewDescription: 'Quick style preview for the public menu colors and typography.',
      placeholderName: 'Example: Pho Gia Truyen',
      placeholderSlug: 'Example: pho-gia-truyen',
      placeholderAddress: 'Example: 123 ABC Street, District 1, HCMC',
      placeholderPhone: '090...',
      optionLarge: 'Large',
      optionNormal: 'Normal',
      optionCompact: 'Compact',
      errorNameRequired: 'Store name is required.',
      errorSlugRequired: 'Menu path (slug) is required.',
      errorSlugTaken: 'This menu path is already taken. Please choose a different one.',
      uploadImageError: 'Could not upload image. Please check Firebase Storage and try again.',
      successUpdate: 'Store updated successfully!',
      successCreate: 'New store created successfully!',
      saveError: 'An error occurred while saving settings.'
    }
  }
} as const;

interface TranslationContextValue {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const TranslationContext = createContext<TranslationContextValue | undefined>(undefined);

function getNestedTranslation(translations: any, path: string): string | undefined {
  return path.split('.').reduce((value, key) => (value && typeof value === 'object' ? value[key] : undefined), translations);
}

function interpolate(text: string, params?: Record<string, string>) {
  if (!params) return text;
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replace(new RegExp(`\\{${key}\\}`, 'g'), value),
    text
  );
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(resolveInitialLanguage);

  const setLang = useCallback((nextLang: LanguageCode) => {
    setLangState(nextLang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, nextLang);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !isLanguageCode(event.newValue)) {
        return;
      }
      setLangState(event.newValue);
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const value = useMemo<TranslationContextValue>(() => ({
    lang,
    setLang,
    t: (key: string, params?: Record<string, string>) => {
      const translation = getNestedTranslation(TRANSLATIONS[lang], key) ?? getNestedTranslation(TRANSLATIONS.vi, key) ?? key;
      return interpolate(translation, params);
    }
  }), [lang]);

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}
