/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getAcademyStudents = /* GraphQL */ `
  query GetAcademyStudents($id: ID!) {
    getAcademyStudents(id: $id) {
      id
      status
      name
      urlImage
      email
      birthdate
      years
      address
      phone
      profession
      studiesRelated
      medicalHistory
      emergencyContact
      isPaid
      isSponsored
      certificate {
        id
        title
        studentName
        instructorName
        instructorSignature
        descriptionOne
        theoreticalHours
        practicalHours
        date
        isOfficialCertification
        location
        createdAt
        updatedAt
        certificatesStudentId
        certificatesCourseId
        __typename
      }
      createdAt
      updatedAt
      academyCoursesStudentsId
      academyStudentsCertificateId
      __typename
    }
  }
`;
export const listAcademyStudents = /* GraphQL */ `
  query ListAcademyStudents(
    $id: ID
    $filter: ModelAcademyStudentsFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listAcademyStudents(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        status
        name
        urlImage
        email
        birthdate
        years
        address
        phone
        profession
        studiesRelated
        medicalHistory
        emergencyContact
        isPaid
        isSponsored
        createdAt
        updatedAt
        academyCoursesStudentsId
        academyStudentsCertificateId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getCertificates = /* GraphQL */ `
  query GetCertificates($id: ID!) {
    getCertificates(id: $id) {
      id
      title
      studentName
      instructorName
      instructorSignature
      descriptionOne
      theoreticalHours
      practicalHours
      date
      isOfficialCertification
      location
      student {
        id
        status
        name
        urlImage
        email
        birthdate
        years
        address
        phone
        profession
        studiesRelated
        medicalHistory
        emergencyContact
        isPaid
        isSponsored
        createdAt
        updatedAt
        academyCoursesStudentsId
        academyStudentsCertificateId
        __typename
      }
      course {
        id
        name
        description
        isActive
        createdAt
        updatedAt
        academyCoursesCertificateId
        __typename
      }
      createdAt
      updatedAt
      certificatesStudentId
      certificatesCourseId
      __typename
    }
  }
`;
export const listCertificates = /* GraphQL */ `
  query ListCertificates(
    $id: ID
    $filter: ModelCertificatesFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listCertificates(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        title
        studentName
        instructorName
        instructorSignature
        descriptionOne
        theoreticalHours
        practicalHours
        date
        isOfficialCertification
        location
        createdAt
        updatedAt
        certificatesStudentId
        certificatesCourseId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getAcademyCourses = /* GraphQL */ `
  query GetAcademyCourses($id: ID!) {
    getAcademyCourses(id: $id) {
      id
      name
      description
      isActive
      students {
        nextToken
        __typename
      }
      certificate {
        id
        title
        studentName
        instructorName
        instructorSignature
        descriptionOne
        theoreticalHours
        practicalHours
        date
        isOfficialCertification
        location
        createdAt
        updatedAt
        certificatesStudentId
        certificatesCourseId
        __typename
      }
      createdAt
      updatedAt
      academyCoursesCertificateId
      __typename
    }
  }
`;
export const listAcademyCourses = /* GraphQL */ `
  query ListAcademyCourses(
    $id: ID
    $filter: ModelAcademyCoursesFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listAcademyCourses(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        name
        description
        isActive
        createdAt
        updatedAt
        academyCoursesCertificateId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getEmailSend = /* GraphQL */ `
  query GetEmailSend($id: ID!) {
    getEmailSend(id: $id) {
      id
      date
      type
      contentEmail
      email
      wasSent
      userSend {
        id
        name
        email
        validated
        contactPhone
        ig
        firstContact
        createdAt
        updatedAt
        usersRolesId
        __typename
      }
      student {
        id
        name
        lastName
        middleName
        birthdate
        placeOfResidence
        contactPhone
        whoIsTheContact
        emailPhone
        gender
        firstSwimmingClass
        attendedDaycare
        immersesWithoutSwallowingWater
        bornPrematurely
        waterOnHisFaceBothersHim
        putYourFaceInTheWater
        anyIllnessInjuryMedicalCondition
        createdAt
        updatedAt
        studentSessionDetailId
        __typename
      }
      createdAt
      updatedAt
      studentEmailSendId
      usersEmailSendId
      __typename
    }
  }
`;
export const listEmailSends = /* GraphQL */ `
  query ListEmailSends(
    $id: ID
    $filter: ModelEmailSendFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listEmailSends(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        date
        type
        contentEmail
        email
        wasSent
        createdAt
        updatedAt
        studentEmailSendId
        usersEmailSendId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getSentEmail = /* GraphQL */ `
  query GetSentEmail($id: ID!) {
    getSentEmail(id: $id) {
      id
      emailState
      body
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listSentEmails = /* GraphQL */ `
  query ListSentEmails(
    $id: ID
    $filter: ModelSentEmailFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listSentEmails(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        emailState
        body
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getExpense = /* GraphQL */ `
  query GetExpense($id: ID!) {
    getExpense(id: $id) {
      id
      amount
      description
      date
      day
      month
      year
      expenseType
      costCenterType
      location {
        id
        name
        city
        minimumTemperature
        maximumTemperature
        address
        phone
        imageMap
        urlMap
        directions
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      locationExpensesId
      __typename
    }
  }
`;
export const listExpenses = /* GraphQL */ `
  query ListExpenses(
    $id: ID
    $filter: ModelExpenseFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listExpenses(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        amount
        description
        date
        day
        month
        year
        expenseType
        costCenterType
        createdAt
        updatedAt
        locationExpensesId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getParametersEnc = /* GraphQL */ `
  query GetParametersEnc($id: ID!) {
    getParametersEnc(id: $id) {
      id
      typeOfParameter {
        nextToken
        __typename
      }
      description
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listParametersEncs = /* GraphQL */ `
  query ListParametersEncs(
    $id: ID
    $filter: ModelParametersEncFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listParametersEncs(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        description
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getMetadata = /* GraphQL */ `
  query GetMetadata($id: ID!) {
    getMetadata(id: $id) {
      id
      key
      value
      metadata {
        id
        label
        value
        idParent
        createdAt
        updatedAt
        parametersEncTypeOfParameterId
        __typename
      }
      createdAt
      updatedAt
      parametersMetadataId
      __typename
    }
  }
`;
export const listMetadata = /* GraphQL */ `
  query ListMetadata(
    $filter: ModelMetadataFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMetadata(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        key
        value
        createdAt
        updatedAt
        parametersMetadataId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getParameters = /* GraphQL */ `
  query GetParameters($id: ID!) {
    getParameters(id: $id) {
      id
      typeOfParameter {
        id
        description
        createdAt
        updatedAt
        __typename
      }
      label
      value
      idParent
      metadata {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      parametersEncTypeOfParameterId
      __typename
    }
  }
`;
export const listParameters = /* GraphQL */ `
  query ListParameters(
    $id: ID
    $filter: ModelParametersFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listParameters(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        label
        value
        idParent
        createdAt
        updatedAt
        parametersEncTypeOfParameterId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getRoles = /* GraphQL */ `
  query GetRoles($id: ID!) {
    getRoles(id: $id) {
      id
      name
      displayName
      icon
      rolPermissions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listRoles = /* GraphQL */ `
  query ListRoles(
    $id: ID
    $filter: ModelRolesFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listRoles(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        name
        displayName
        icon
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getPermissions = /* GraphQL */ `
  query GetPermissions($id: ID!) {
    getPermissions(id: $id) {
      id
      displayName
      name
      icon
      order
      Padre {
        id
        displayName
        name
        icon
        order
        createdAt
        updatedAt
        permissionsSubmenuId
        __typename
      }
      Submenu {
        nextToken
        __typename
      }
      rolPermissions {
        nextToken
        __typename
      }
      userPermissions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      permissionsSubmenuId
      __typename
    }
  }
`;
export const listPermissions = /* GraphQL */ `
  query ListPermissions(
    $id: ID
    $filter: ModelPermissionsFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listPermissions(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        displayName
        name
        icon
        order
        createdAt
        updatedAt
        permissionsSubmenuId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getLocation = /* GraphQL */ `
  query GetLocation($id: ID!) {
    getLocation(id: $id) {
      id
      name
      city
      minimumTemperature
      maximumTemperature
      address
      phone
      imageMap
      urlMap
      directions
      courses {
        nextToken
        __typename
      }
      schedules {
        nextToken
        __typename
      }
      expenses {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listLocations = /* GraphQL */ `
  query ListLocations(
    $id: ID
    $filter: ModelLocationFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listLocations(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        name
        city
        minimumTemperature
        maximumTemperature
        address
        phone
        imageMap
        urlMap
        directions
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getCourse = /* GraphQL */ `
  query GetCourse($id: ID!) {
    getCourse(id: $id) {
      id
      title
      description
      startingAge
      endingAge
      ageType
      AgeGroupType
      duration
      isActive
      location {
        id
        name
        city
        minimumTemperature
        maximumTemperature
        address
        phone
        imageMap
        urlMap
        directions
        createdAt
        updatedAt
        __typename
      }
      schedules {
        nextToken
        __typename
      }
      sessionTypes {
        nextToken
        __typename
      }
      enrollments {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      locationCoursesId
      __typename
    }
  }
`;
export const listCourses = /* GraphQL */ `
  query ListCourses(
    $id: ID
    $filter: ModelCourseFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listCourses(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        title
        description
        startingAge
        endingAge
        ageType
        AgeGroupType
        duration
        isActive
        createdAt
        updatedAt
        locationCoursesId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getSchedule = /* GraphQL */ `
  query GetSchedule($id: ID!) {
    getSchedule(id: $id) {
      id
      day
      startHour
      endHour
      isActive
      minimumQuotas
      maximumQuotas
      course {
        id
        title
        description
        startingAge
        endingAge
        ageType
        AgeGroupType
        duration
        isActive
        createdAt
        updatedAt
        locationCoursesId
        __typename
      }
      location {
        id
        name
        city
        minimumTemperature
        maximumTemperature
        address
        phone
        imageMap
        urlMap
        directions
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      locationSchedulesId
      courseSchedulesId
      __typename
    }
  }
`;
export const listSchedules = /* GraphQL */ `
  query ListSchedules(
    $id: ID
    $filter: ModelScheduleFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listSchedules(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        day
        startHour
        endHour
        isActive
        minimumQuotas
        maximumQuotas
        createdAt
        updatedAt
        locationSchedulesId
        courseSchedulesId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getSessionType = /* GraphQL */ `
  query GetSessionType($id: ID!) {
    getSessionType(id: $id) {
      id
      name
      description
      durationSession
      timeAWeek
      totalSessions
      amount
      packValidity
      courses {
        nextToken
        __typename
      }
      enrollments {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listSessionTypes = /* GraphQL */ `
  query ListSessionTypes(
    $id: ID
    $filter: ModelSessionTypeFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listSessionTypes(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        name
        description
        durationSession
        timeAWeek
        totalSessions
        amount
        packValidity
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getStudent = /* GraphQL */ `
  query GetStudent($id: ID!) {
    getStudent(id: $id) {
      id
      name
      lastName
      middleName
      birthdate
      placeOfResidence
      contactPhone
      whoIsTheContact
      emailPhone
      gender
      firstSwimmingClass
      attendedDaycare
      immersesWithoutSwallowingWater
      bornPrematurely
      waterOnHisFaceBothersHim
      putYourFaceInTheWater
      anyIllnessInjuryMedicalCondition
      enrollments {
        nextToken
        __typename
      }
      relationships {
        nextToken
        __typename
      }
      sessionDetail {
        id
        date
        day
        month
        year
        sessionNumber
        totalSessions
        status
        proratedValue
        wasEmailSent
        locationId
        locationIdUsed
        createdAt
        updatedAt
        enrollmentSessionDetailsId
        sessionDetailStudentId
        __typename
      }
      emailSend {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      studentSessionDetailId
      __typename
    }
  }
`;
export const listStudents = /* GraphQL */ `
  query ListStudents(
    $id: ID
    $filter: ModelStudentFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listStudents(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        name
        lastName
        middleName
        birthdate
        placeOfResidence
        contactPhone
        whoIsTheContact
        emailPhone
        gender
        firstSwimmingClass
        attendedDaycare
        immersesWithoutSwallowingWater
        bornPrematurely
        waterOnHisFaceBothersHim
        putYourFaceInTheWater
        anyIllnessInjuryMedicalCondition
        createdAt
        updatedAt
        studentSessionDetailId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getEnrollment = /* GraphQL */ `
  query GetEnrollment($id: ID!) {
    getEnrollment(id: $id) {
      id
      amountPaid
      startDate
      endDate
      wasPaid
      timeAWeek
      numberOfSessions
      sessionsLeft
      sessionsUsed
      scheduleId
      scheduleName
      student {
        id
        name
        lastName
        middleName
        birthdate
        placeOfResidence
        contactPhone
        whoIsTheContact
        emailPhone
        gender
        firstSwimmingClass
        attendedDaycare
        immersesWithoutSwallowingWater
        bornPrematurely
        waterOnHisFaceBothersHim
        putYourFaceInTheWater
        anyIllnessInjuryMedicalCondition
        createdAt
        updatedAt
        studentSessionDetailId
        __typename
      }
      sessionType {
        id
        name
        description
        durationSession
        timeAWeek
        totalSessions
        amount
        packValidity
        createdAt
        updatedAt
        __typename
      }
      course {
        id
        title
        description
        startingAge
        endingAge
        ageType
        AgeGroupType
        duration
        isActive
        createdAt
        updatedAt
        locationCoursesId
        __typename
      }
      transaction {
        id
        amount
        date
        paymentMethod
        status
        createdAt
        updatedAt
        transactionEnrollmentId
        __typename
      }
      sessionDetails {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      courseEnrollmentsId
      sessionTypeEnrollmentsId
      studentEnrollmentsId
      enrollmentTransactionId
      __typename
    }
  }
`;
export const listEnrollments = /* GraphQL */ `
  query ListEnrollments(
    $id: ID
    $filter: ModelEnrollmentFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listEnrollments(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        amountPaid
        startDate
        endDate
        wasPaid
        timeAWeek
        numberOfSessions
        sessionsLeft
        sessionsUsed
        scheduleId
        scheduleName
        createdAt
        updatedAt
        courseEnrollmentsId
        sessionTypeEnrollmentsId
        studentEnrollmentsId
        enrollmentTransactionId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getSessionDetail = /* GraphQL */ `
  query GetSessionDetail($id: ID!) {
    getSessionDetail(id: $id) {
      id
      date
      day
      month
      year
      sessionNumber
      totalSessions
      status
      proratedValue
      wasEmailSent
      locationId
      locationIdUsed
      student {
        id
        name
        lastName
        middleName
        birthdate
        placeOfResidence
        contactPhone
        whoIsTheContact
        emailPhone
        gender
        firstSwimmingClass
        attendedDaycare
        immersesWithoutSwallowingWater
        bornPrematurely
        waterOnHisFaceBothersHim
        putYourFaceInTheWater
        anyIllnessInjuryMedicalCondition
        createdAt
        updatedAt
        studentSessionDetailId
        __typename
      }
      createdAt
      updatedAt
      enrollmentSessionDetailsId
      sessionDetailStudentId
      __typename
    }
  }
`;
export const listSessionDetails = /* GraphQL */ `
  query ListSessionDetails(
    $filter: ModelSessionDetailFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSessionDetails(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        date
        day
        month
        year
        sessionNumber
        totalSessions
        status
        proratedValue
        wasEmailSent
        locationId
        locationIdUsed
        createdAt
        updatedAt
        enrollmentSessionDetailsId
        sessionDetailStudentId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getSupportTicket = /* GraphQL */ `
  query GetSupportTicket($id: ID!) {
    getSupportTicket(id: $id) {
      id
      name
      email
      phoneNumber
      description
      date
      day
      month
      year
      lastModificationUser
      statusTicket
      reason
      userTickets {
        nextToken
        __typename
      }
      ticketComments {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listSupportTickets = /* GraphQL */ `
  query ListSupportTickets(
    $filter: ModelSupportTicketFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSupportTickets(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        email
        phoneNumber
        description
        date
        day
        month
        year
        lastModificationUser
        statusTicket
        reason
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getCommentTickets = /* GraphQL */ `
  query GetCommentTickets($id: ID!) {
    getCommentTickets(id: $id) {
      id
      description
      statusModificationIdUser
      statusModificationUser
      ticketComments {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listCommentTickets = /* GraphQL */ `
  query ListCommentTickets(
    $filter: ModelCommentTicketsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCommentTickets(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        description
        statusModificationIdUser
        statusModificationUser
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getTransaction = /* GraphQL */ `
  query GetTransaction($id: ID!) {
    getTransaction(id: $id) {
      id
      amount
      date
      paymentMethod
      status
      enrollment {
        id
        amountPaid
        startDate
        endDate
        wasPaid
        timeAWeek
        numberOfSessions
        sessionsLeft
        sessionsUsed
        scheduleId
        scheduleName
        createdAt
        updatedAt
        courseEnrollmentsId
        sessionTypeEnrollmentsId
        studentEnrollmentsId
        enrollmentTransactionId
        __typename
      }
      createdAt
      updatedAt
      transactionEnrollmentId
      __typename
    }
  }
`;
export const listTransactions = /* GraphQL */ `
  query ListTransactions(
    $id: ID
    $filter: ModelTransactionFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listTransactions(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        amount
        date
        paymentMethod
        status
        createdAt
        updatedAt
        transactionEnrollmentId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getUsers = /* GraphQL */ `
  query GetUsers($id: ID!) {
    getUsers(id: $id) {
      id
      name
      email
      validated
      contactPhone
      ig
      firstContact
      emailSend {
        nextToken
        __typename
      }
      relationships {
        nextToken
        __typename
      }
      userTickets {
        nextToken
        __typename
      }
      roles {
        id
        name
        displayName
        icon
        createdAt
        updatedAt
        __typename
      }
      userPermissions {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      usersRolesId
      __typename
    }
  }
`;
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $id: ID
    $filter: ModelUsersFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listUsers(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        name
        email
        validated
        contactPhone
        ig
        firstContact
        createdAt
        updatedAt
        usersRolesId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getRelationship = /* GraphQL */ `
  query GetRelationship($id: ID!) {
    getRelationship(id: $id) {
      id
      user {
        id
        name
        email
        validated
        contactPhone
        ig
        firstContact
        createdAt
        updatedAt
        usersRolesId
        __typename
      }
      student {
        id
        name
        lastName
        middleName
        birthdate
        placeOfResidence
        contactPhone
        whoIsTheContact
        emailPhone
        gender
        firstSwimmingClass
        attendedDaycare
        immersesWithoutSwallowingWater
        bornPrematurely
        waterOnHisFaceBothersHim
        putYourFaceInTheWater
        anyIllnessInjuryMedicalCondition
        createdAt
        updatedAt
        studentSessionDetailId
        __typename
      }
      relationType
      createdAt
      updatedAt
      studentRelationshipsId
      usersRelationshipsId
      __typename
    }
  }
`;
export const listRelationships = /* GraphQL */ `
  query ListRelationships(
    $id: ID
    $filter: ModelRelationshipFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listRelationships(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        relationType
        createdAt
        updatedAt
        studentRelationshipsId
        usersRelationshipsId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getRolPermissions = /* GraphQL */ `
  query GetRolPermissions($id: ID!) {
    getRolPermissions(id: $id) {
      id
      rolesId
      permissionsId
      roles {
        id
        name
        displayName
        icon
        createdAt
        updatedAt
        __typename
      }
      permissions {
        id
        displayName
        name
        icon
        order
        createdAt
        updatedAt
        permissionsSubmenuId
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listRolPermissions = /* GraphQL */ `
  query ListRolPermissions(
    $filter: ModelRolPermissionsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listRolPermissions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        rolesId
        permissionsId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getUserPermissions = /* GraphQL */ `
  query GetUserPermissions($id: ID!) {
    getUserPermissions(id: $id) {
      id
      permissionsId
      usersId
      permissions {
        id
        displayName
        name
        icon
        order
        createdAt
        updatedAt
        permissionsSubmenuId
        __typename
      }
      users {
        id
        name
        email
        validated
        contactPhone
        ig
        firstContact
        createdAt
        updatedAt
        usersRolesId
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listUserPermissions = /* GraphQL */ `
  query ListUserPermissions(
    $filter: ModelUserPermissionsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUserPermissions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        permissionsId
        usersId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getCourseSessionType = /* GraphQL */ `
  query GetCourseSessionType($id: ID!) {
    getCourseSessionType(id: $id) {
      id
      courseId
      sessionTypeId
      course {
        id
        title
        description
        startingAge
        endingAge
        ageType
        AgeGroupType
        duration
        isActive
        createdAt
        updatedAt
        locationCoursesId
        __typename
      }
      sessionType {
        id
        name
        description
        durationSession
        timeAWeek
        totalSessions
        amount
        packValidity
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listCourseSessionTypes = /* GraphQL */ `
  query ListCourseSessionTypes(
    $filter: ModelCourseSessionTypeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCourseSessionTypes(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        courseId
        sessionTypeId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getTicketUser = /* GraphQL */ `
  query GetTicketUser($id: ID!) {
    getTicketUser(id: $id) {
      id
      supportTicketId
      usersId
      supportTicket {
        id
        name
        email
        phoneNumber
        description
        date
        day
        month
        year
        lastModificationUser
        statusTicket
        reason
        createdAt
        updatedAt
        __typename
      }
      users {
        id
        name
        email
        validated
        contactPhone
        ig
        firstContact
        createdAt
        updatedAt
        usersRolesId
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listTicketUsers = /* GraphQL */ `
  query ListTicketUsers(
    $filter: ModelTicketUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTicketUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        supportTicketId
        usersId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getComments = /* GraphQL */ `
  query GetComments($id: ID!) {
    getComments(id: $id) {
      id
      supportTicketId
      commentTicketsId
      supportTicket {
        id
        name
        email
        phoneNumber
        description
        date
        day
        month
        year
        lastModificationUser
        statusTicket
        reason
        createdAt
        updatedAt
        __typename
      }
      commentTickets {
        id
        description
        statusModificationIdUser
        statusModificationUser
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listComments = /* GraphQL */ `
  query ListComments(
    $filter: ModelCommentsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listComments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        supportTicketId
        commentTicketsId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const rolPermissionsByRolesId = /* GraphQL */ `
  query RolPermissionsByRolesId(
    $rolesId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelRolPermissionsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    rolPermissionsByRolesId(
      rolesId: $rolesId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        rolesId
        permissionsId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const rolPermissionsByPermissionsId = /* GraphQL */ `
  query RolPermissionsByPermissionsId(
    $permissionsId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelRolPermissionsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    rolPermissionsByPermissionsId(
      permissionsId: $permissionsId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        rolesId
        permissionsId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const userPermissionsByPermissionsId = /* GraphQL */ `
  query UserPermissionsByPermissionsId(
    $permissionsId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelUserPermissionsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    userPermissionsByPermissionsId(
      permissionsId: $permissionsId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        permissionsId
        usersId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const userPermissionsByUsersId = /* GraphQL */ `
  query UserPermissionsByUsersId(
    $usersId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelUserPermissionsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    userPermissionsByUsersId(
      usersId: $usersId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        permissionsId
        usersId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const courseSessionTypesByCourseId = /* GraphQL */ `
  query CourseSessionTypesByCourseId(
    $courseId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelCourseSessionTypeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    courseSessionTypesByCourseId(
      courseId: $courseId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        courseId
        sessionTypeId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const courseSessionTypesBySessionTypeId = /* GraphQL */ `
  query CourseSessionTypesBySessionTypeId(
    $sessionTypeId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelCourseSessionTypeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    courseSessionTypesBySessionTypeId(
      sessionTypeId: $sessionTypeId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        courseId
        sessionTypeId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const ticketUsersBySupportTicketId = /* GraphQL */ `
  query TicketUsersBySupportTicketId(
    $supportTicketId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelTicketUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ticketUsersBySupportTicketId(
      supportTicketId: $supportTicketId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        supportTicketId
        usersId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const ticketUsersByUsersId = /* GraphQL */ `
  query TicketUsersByUsersId(
    $usersId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelTicketUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    ticketUsersByUsersId(
      usersId: $usersId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        supportTicketId
        usersId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const commentsBySupportTicketId = /* GraphQL */ `
  query CommentsBySupportTicketId(
    $supportTicketId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelCommentsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    commentsBySupportTicketId(
      supportTicketId: $supportTicketId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        supportTicketId
        commentTicketsId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const commentsByCommentTicketsId = /* GraphQL */ `
  query CommentsByCommentTicketsId(
    $commentTicketsId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelCommentsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    commentsByCommentTicketsId(
      commentTicketsId: $commentTicketsId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        supportTicketId
        commentTicketsId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
