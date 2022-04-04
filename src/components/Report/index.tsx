import { gql, useMutation, useQuery } from '@apollo/client'
import { GridItemEight, GridItemFour, GridLayout } from '@components/GridLayout'
import { POST_QUERY } from '@components/Post'
import SinglePost from '@components/Post/SinglePost'
import SettingsHelper from '@components/Shared/SettingsHelper'
import PostShimmer from '@components/Shared/Shimmer/PostShimmer'
import { Button } from '@components/UI/Button'
import { Card, CardBody } from '@components/UI/Card'
import { ErrorMessage } from '@components/UI/ErrorMessage'
import { Form, useZodForm } from '@components/UI/Form'
import { Spinner } from '@components/UI/Spinner'
import { TextArea } from '@components/UI/TextArea'
import AppContext from '@components/utils/AppContext'
import SEO from '@components/utils/SEO'
import { PencilAltIcon } from '@heroicons/react/outline'
import { useRouter } from 'next/router'
import React, { useContext, useState } from 'react'
import { ZERO_ADDRESS } from 'src/constants'
import Custom404 from 'src/pages/404'
import { object, string } from 'zod'

import Reason from './Reason'

export const CREATE_REPORT_PUBLICATION_MUTATION = gql`
  mutation ReportPublication($request: ReportPublicationRequest!) {
    reportPublication(request: $request)
  }
`

const newReportSchema = object({
  additionalComments: string()
    .max(260, {
      message: 'Additional comments should not exceed 260 characters'
    })
    .nullable()
})

const Report: React.FC = () => {
  const {
    query: { id }
  } = useRouter()
  const [reason, setReason] = useState<string>()
  const [subReason, setSubReason] = useState<string>()
  const { currentUser } = useContext(AppContext)
  const { data, loading, error } = useQuery(POST_QUERY, {
    variables: {
      request: { publicationId: id },
      followRequest: {
        followInfos: {
          followerAddress: currentUser?.ownedBy
            ? currentUser?.ownedBy
            : ZERO_ADDRESS,
          profileId: id?.toString().split('-')[0]
        }
      }
    },
    skip: !id
  })
  const [createReport, { loading: submitLoading, error: submitError }] =
    useMutation(CREATE_REPORT_PUBLICATION_MUTATION)

  const form = useZodForm({
    schema: newReportSchema
  })

  const reportPublication = (additionalComments: string | null) => {
    createReport({
      variables: {
        request: {
          publicationId: '0x9b-0x0f',
          reason: {
            sensitiveReason: {
              reason: 'SENSITIVE',
              subreason: 'OFFENSIVE'
            }
          },
          additionalComments
        }
      }
    })
  }

  if (!currentUser || !id) return <Custom404 />

  return (
    <GridLayout>
      <SEO title="Report • Lenster" />
      <GridItemFour>
        <SettingsHelper
          heading="Report publication"
          description="Help us understand the problem. What is going on with this publication?"
        />
      </GridItemFour>
      <GridItemEight>
        <Card>
          <CardBody>
            {error && (
              <ErrorMessage title="Failed to load post" error={error} />
            )}
            {loading && !error ? (
              <PostShimmer />
            ) : (
              <SinglePost post={data?.publication} />
            )}
            <Form
              form={form}
              className="pt-5 space-y-4"
              onSubmit={({ additionalComments }) => {
                reportPublication(additionalComments)
              }}
            >
              {submitError && (
                <ErrorMessage title="Failed to report" error={submitError} />
              )}
              <Reason setReason={setReason} setSubReason={setSubReason} />
              <TextArea
                label="Description"
                placeholder="Tell us something about the community!"
                {...form.register('additionalComments')}
              />
              <div className="ml-auto">
                <Button
                  type="submit"
                  disabled={submitLoading}
                  icon={
                    submitLoading ? (
                      <Spinner size="xs" />
                    ) : (
                      <PencilAltIcon className="w-4 h-4" />
                    )
                  }
                >
                  Report
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </GridItemEight>
    </GridLayout>
  )
}

export default Report