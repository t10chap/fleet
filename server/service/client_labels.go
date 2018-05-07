package service

import (
	"encoding/json"
	"net/http"
	"net/url"

	"github.com/kolide/fleet/server/kolide"
	"github.com/pkg/errors"
)

// ApplyLabelSpecs sends the list of Labels to be applied (upserted) to the
// Fleet instance.
func (c *Client) ApplyLabelSpecs(specs []*kolide.LabelSpec) error {
	req := applyLabelSpecsRequest{Specs: specs}
	response, err := c.Do("POST", "/api/v1/kolide/spec/labels", req)
	if err != nil {
		return errors.Wrap(err, "POST /api/v1/kolide/spec/labels")
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return errors.Errorf("apply label spec got HTTP %d, expected 200", response.StatusCode)
	}

	var responseBody applyLabelSpecsResponse
	err = json.NewDecoder(response.Body).Decode(&responseBody)
	if err != nil {
		return errors.Wrap(err, "decode apply label spec response")
	}

	if responseBody.Err != nil {
		return errors.Errorf("apply label spec: %s", responseBody.Err)
	}

	return nil
}

// GetLabelSpecs retrieves the list of all Labels.
func (c *Client) GetLabelSpecs(specs []*kolide.LabelSpec) ([]*kolide.LabelSpec, error) {
	req := applyLabelSpecsRequest{Specs: specs}
	response, err := c.Do("GET", "/api/v1/kolide/spec/labels", req)
	if err != nil {
		return nil, errors.Wrap(err, "GET /api/v1/kolide/spec/labels")
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return nil, errors.Errorf("get label spec got HTTP %d, expected 200", response.StatusCode)
	}

	var responseBody getLabelSpecsResponse
	err = json.NewDecoder(response.Body).Decode(&responseBody)
	if err != nil {
		return nil, errors.Wrap(err, "decode get label spec response")
	}

	if responseBody.Err != nil {
		return nil, errors.Errorf("get label spec: %s", responseBody.Err)
	}

	return responseBody.Specs, nil
}

// DeleteLabel deletes the label with the matching name.
func (c *Client) DeleteLabel(name string) error {
	verb, path := "DELETE", "/api/v1/kolide/labels/"+url.QueryEscape(name)
	response, err := c.Do(verb, path, nil)
	if err != nil {
		return errors.Wrapf(err, "%s %s", verb, path)
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return errors.Errorf("get label spec got HTTP %d, expected 200", response.StatusCode)
	}

	var responseBody deleteLabelResponse
	err = json.NewDecoder(response.Body).Decode(&responseBody)
	if err != nil {
		return errors.Wrap(err, "decode get label spec response")
	}

	if responseBody.Err != nil {
		return errors.Errorf("get label spec: %s", responseBody.Err)
	}

	return nil
}
